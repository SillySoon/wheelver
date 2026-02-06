// src/config/database.ts
import mongoose from "mongoose";
import { MONGODB_URI } from "./env";
import logger from "silly-logger";

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        logger.success("MongoDB connection successful!");
    })
    .catch((error: any) => {
        logger.error(`Error connecting to MongoDB: ${error}`);
    });
