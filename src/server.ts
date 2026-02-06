import app from "./app";
import logger from "silly-logger";

logger.timeFormat("MMM Do YY - h:mm:ss a");

const port = 3000;

app.listen(port, () => {
    logger.success(`🚀 Server running at http://localhost:${port}`);
});