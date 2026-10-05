// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { HttpError, notFound } from "../errors/HttpError";
import { createLogger } from "../utils/logger";

const { logError } = createLogger("ERROR_HANDLER", "red");

/** Maps known error types to an HttpError; anything else becomes a generic 500. */
const toHttpError = (err: unknown): HttpError => {
    if (err instanceof HttpError) return err;

    if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
        return new HttpError(400, details[0]?.message ?? "Validation failed", details);
    }

    if (err instanceof mongoose.Error.CastError) return new HttpError(400, "Invalid ID format");
    if (err instanceof mongoose.Error.ValidationError) return new HttpError(400, "Validation failed");
    if ((err as { code?: number })?.code === 11000) return new HttpError(409, "Already exists");

    // Errors from body-parser (malformed JSON, payload too large)
    const status = (err as { status?: number })?.status;
    if (status === 400) return new HttpError(400, "Malformed request body");
    if (status === 413) return new HttpError(413, "Request body too large");

    return new HttpError(500, "Internal server error");
};

const wantsJson = (req: Request) => req.originalUrl.startsWith("/api") || !req.accepts("html");

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    next(notFound(wantsJson(req) ? "Not found" : "The page you are looking for does not exist."));
};

// Express recognizes error handlers by their four parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const httpError = toHttpError(err);

    if (httpError.status >= 500) {
        logError(`${req.method} ${req.originalUrl}: ${err instanceof Error ? err.stack : String(err)}`);
    }

    if (res.headersSent) return;

    if (wantsJson(req)) {
        res.status(httpError.status).json({
            message: httpError.message,
            ...(httpError.details ? { details: httpError.details } : {}),
        });
        return;
    }

    res.status(httpError.status).render("site/error", { status: httpError.status, message: httpError.message });
};
