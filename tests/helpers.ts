// Shared fixtures and a real session-based login for tests
import crypto from "crypto";
import type { SessionData } from "express-session";
import signature from "cookie-signature";
import request from "supertest";
import app, { sessionStore } from "../src/app";
import { User, Series, Hotwheel, Collection, CollectionItem } from "../src/models";

export const ADMIN_DISCORD_ID = "900000000000000001";
export const CSRF_TOKEN = "test-csrf-token";

let counter = 0;
const nextId = () => `${Date.now()}${++counter}`;

export const createUser = async (overrides: Record<string, unknown> = {}) => {
    const n = nextId();
    return await User.create({ discordId: `1${n}`, handle: `user${n}`, displayName: `User ${n}`, ...overrides });
};

export const createAdmin = () => createUser({ discordId: ADMIN_DISCORD_ID });

export const createHotwheel = async (overrides: Record<string, unknown> = {}) => {
    const n = nextId();
    const series = await Series.create({ name: `Series ${n}`, shortName: `S${n}` });
    return await Hotwheel.create({
        toyNumber: `T${n}`,
        name: `Car ${n}`,
        series: series._id,
        seriesNumber: 1,
        year: 2024,
        ...overrides,
    });
};

export const createCollection = async (owner: { _id: unknown }, name = "My Collection") => {
    return await Collection.create({ name, owner: owner._id });
};

export const addItems = async (
    collection: { _id: unknown; owner: unknown },
    hotwheel: { _id: unknown },
    count: number,
) => {
    return await CollectionItem.insertMany(
        Array.from({ length: count }, () => ({
            collectionId: collection._id,
            hotwheel: hotwheel._id,
            owner: collection.owner,
        })),
    );
};

/**
 * Creates a logged-in session for the user directly in the session store
 * and returns headers (cookie + CSRF token) to send with requests.
 */
export const loginAs = async (user: { _id: unknown }) => {
    const sid = crypto.randomBytes(16).toString("hex");
    const sessionData = {
        cookie: { originalMaxAge: 60_000, expires: new Date(Date.now() + 60_000), httpOnly: true, path: "/" },
        passport: { user: String(user._id) },
        csrfToken: CSRF_TOKEN,
    } as unknown as SessionData;
    await new Promise<void>((resolve, reject) =>
        sessionStore.set(sid, sessionData, (err) => (err ? reject(err) : resolve())),
    );

    const cookie = `connect.sid=${encodeURIComponent("s:" + signature.sign(sid, process.env.SESSION_SECRET!))}`;
    return { Cookie: cookie, "X-CSRF-Token": CSRF_TOKEN };
};

export const api = () => request(app);
