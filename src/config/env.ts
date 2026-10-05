// src/config/env.ts
import dotenv from "dotenv";
import logger from "silly-logger";

dotenv.config({ quiet: true });

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_TEST = process.env.NODE_ENV === "test";

/** Returns a required variable or exits the process. */
const required = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        logger.error(`${name} is not defined.`);
        process.exit(1);
    }
    return value;
};

/** Returns a variable or its default; missing values are only fatal in production when `requiredInProduction`. */
const optional = (name: string, fallback: string, requiredInProduction = false): string => {
    const value = process.env[name];
    if (value) return value;

    if (requiredInProduction && IS_PRODUCTION) {
        return required(name);
    }
    if (!IS_TEST) {
        logger.warn(`${name} is not defined, using default`);
    }
    return fallback;
};

export const PORT = parseInt(optional("PORT", "3000"), 10);
export const MONGODB_URI = optional("MONGODB_URI", "mongodb://localhost:27017/wheelver", true);
export const DISCORD_CLIENT_ID = required("DISCORD_CLIENT_ID");
export const DISCORD_SECRET = required("DISCORD_SECRET");
export const DISCORD_CALLBACK_URL = optional(
    "DISCORD_CALLBACK_URL",
    "http://localhost:3000/auth/discord/callback",
    true,
);
export const SESSION_SECRET = optional("SESSION_SECRET", "wheelver-secret", true);
export const ADMIN_DISCORD_IDS = (process.env.ADMIN_DISCORD_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
