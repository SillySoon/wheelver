// src/config/passport.ts
import passport from 'passport';
import { Strategy as DiscordStrategy, DiscordProfile, VerifyCallback } from 'discord-strategy';
import User from '../models/User';
import { DISCORD_CLIENT_ID, DISCORD_SECRET, DISCORD_CALLBACK_URL } from './env';

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
            let user = await User.findOne({ discordId: profile.id });
            if (!user) {
                user = await User.create({
                    discordId: profile.id,
                    isRegistered: false
                });
            }
            return done(null, user as any);
        } catch (err) {
            return done(err as Error, undefined);
        }
    })();
}) as any));

export default passport;
