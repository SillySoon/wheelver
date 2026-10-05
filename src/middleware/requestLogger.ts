// src/middleware/requestLogger.ts
import { Request, Response, NextFunction } from "express";
import { createLogger } from "../utils/logger";
import { IS_TEST } from "../config/env";

const { logRequest, logWarning } = createLogger("HTTP", "dark_green");

/** Logs every request with its status and duration once the response is sent. */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    if (IS_TEST) return next();

    const start = Date.now();
    res.on("finish", () => {
        const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`;
        (res.statusCode >= 400 ? logWarning : logRequest)(line);
    });
    next();
};
