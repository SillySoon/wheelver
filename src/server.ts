import mongoose from "mongoose";
import logger from "silly-logger";
import app, { sessionStore } from "./app";
import { PORT } from "./config/env";
import { connectDB } from "./config/database";

logger.timeFormat("MMM Do YY - h:mm:ss a");

const startServer = async () => {
    await connectDB();

    const server = app.listen(PORT, () => {
        logger.success(`🚀 Server running at http://localhost:${PORT}`);
    });

    // Finish open requests and close connections when Docker stops the container
    const shutdown = (signal: string) => {
        logger.info(`${signal} received, shutting down...`);
        server.close(async () => {
            await sessionStore.close();
            await mongoose.disconnect();
            process.exit(0);
        });
        // Force exit if connections do not close in time
        setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer();
