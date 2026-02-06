// src/config/env.ts
import dotenv from 'dotenv';
import logger from 'silly-logger';

dotenv.config();

export let PORT: number;
export let MONGODB_URI: string;

if (!process.env.PORT) {
    logger.warn("PORT is not defined, using default port 3000");
}

if (!process.env.MONGODB_URI) {
    logger.warn("MONGODB_URI is not defined, using localhost");
}


MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/wheelver";
PORT = parseInt(process.env.PORT || "3000", 10);