import app from "./app";
import logger from "silly-logger";
import { PORT } from "./config/env";
import { connectDB } from "./config/database";

logger.timeFormat("MMM Do YY - h:mm:ss a");

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        logger.success(`🚀 Server running at http://localhost:${PORT}`);
    });
};

startServer();