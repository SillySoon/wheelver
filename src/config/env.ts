// src/config/env.ts
import dotenv from 'dotenv';
import logger from 'silly-logger';

dotenv.config();

export let PORT: number;

if (!process.env.PORT) {
    logger.warn("PORT is not defined, using default port 3000");
}

PORT = parseInt(process.env.PORT || "3000", 10);