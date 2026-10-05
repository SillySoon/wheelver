// Runs before every test file, before the app is imported
import { inject, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = inject("mongoUri");
process.env.DISCORD_CLIENT_ID = "test-client-id";
process.env.DISCORD_SECRET = "test-secret";
process.env.SESSION_SECRET = "test-session-secret";
process.env.ADMIN_DISCORD_IDS = "900000000000000001";

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI!);
    await mongoose.connection.syncIndexes();
});

beforeEach(async () => {
    const collections = await mongoose.connection.db!.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
    const { sessionStore } = await import("../src/app");
    await sessionStore.close();
    await mongoose.disconnect();
});
