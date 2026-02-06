import app from "./app";
import logger from "silly-logger";
import { PORT } from "./config/env";

logger.timeFormat("MMM Do YY - h:mm:ss a");

app.listen(PORT, () => {
    logger.success(`🚀 Server running at http://localhost:${PORT}`);
});