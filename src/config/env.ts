// src/config/env.ts
import dotenv from 'dotenv';
import logger from 'silly-logger';

dotenv.config();

export let PORT: number;
export let MONGODB_URI: string;
export let DISCORD_CLIENT_ID: string;
export let DISCORD_SECRET: string;
export let DISCORD_CALLBACK_URL: string;
export let SESSION_SECRET: string;

if (!process.env.PORT) {
    logger.warn("PORT is not defined, using default port 3000");
}

if (!process.env.MONGODB_URI) {
    logger.warn("MONGODB_URI is not defined, using localhost");
}

if (!process.env.DISCORD_CLIENT_ID) {
    logger.error("DISCORD_CLIENT_ID is not defined.");
    process.exit(1);
}

if (!process.env.DISCORD_SECRET) {
    logger.error("DISCORD_SECRET is not defined.");
    process.exit(1);
}

if (!process.env.DISCORD_CALLBACK_URL) {
    logger.warn("DISCORD_CALLBACK_URL is not defined, using default");
}

if (!process.env.SESSION_SECRET) {
    logger.warn("SESSION_SECRET is not defined, using default");
}

MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/wheelver";
PORT = parseInt(process.env.PORT || "3000", 10);
DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
DISCORD_SECRET = process.env.DISCORD_SECRET;
DISCORD_CALLBACK_URL = process.env.DISCORD_CALLBACK_URL || "http://localhost:3000/auth/discord/callback";
SESSION_SECRET = process.env.SESSION_SECRET || "wheelver-secret";