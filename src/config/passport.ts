// src/config/passport.ts
import passport from 'passport';
import { Strategy as DiscordStrategy, DiscordProfile, VerifyCallback } from 'discord-strategy';
import User from '../models/User';
import { DISCORD_CLIENT_ID, DISCORD_SECRET, DISCORD_CALLBACK_URL } from './env';

/**
 * Creates or updates the user from the Discord profile on every login.
 * The handle follows the Discord username; an old handle is kept for redirects.
 */
const syncDiscordUser = async (profile: DiscordProfile) => {
    const handle = profile.username.toLowerCase();
    const displayName = profile.global_name || profile.username;

    // Discord handles are unique, so another user holding this handle in our DB has renamed
    // on Discord since their last login. Park them on their Discord ID until they log in again.
    const staleHolders = await User.find({ handle, discordId: { $ne: profile.id } });
    for (const stale of staleHolders) {
        await User.updateOne({ _id: stale._id }, { $set: { handle: stale.discordId } });
    }

    const existing = await User.findOne({ discordId: profile.id });
    if (!existing) {
        return await User.create({ discordId: profile.id, handle, displayName, lastLoginAt: new Date() });
    }

    if (existing.handle !== handle) {
        if (existing.handle !== existing.discordId && !existing.previousHandles.includes(existing.handle)) {
            existing.previousHandles.push(existing.handle);
        }
        existing.previousHandles = existing.previousHandles.filter((h) => h !== handle);
        existing.handle = handle;
    }
    existing.displayName = displayName;
    existing.lastLoginAt = new Date();
    return await existing.save();
};

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new DiscordStrategy({
    authorizationURL: 'https://discord.com/api/oauth2/authorize',
    tokenURL: 'https://discord.com/api/oauth2/token',
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_SECRET,
    callbackURL: DISCORD_CALLBACK_URL,
    scope: ['identify'] as any
}, ((accessToken: string, refreshToken: string, profile: DiscordProfile, done: VerifyCallback) => {
    (async () => {
        try {
            const user = await syncDiscordUser(profile);
            return done(null, user as any);
        } catch (err) {
            return done(err as Error, undefined);
        }
    })();
}) as any));

export default passport;
