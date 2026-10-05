// src/middleware/csrf.ts
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { forbidden } from "../errors/HttpError";

declare module "express-session" {
    interface SessionData {
        csrfToken?: string;
    }
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const tokensMatch = (expected: string, actual: unknown): boolean => {
    if (typeof actual !== "string" || actual.length !== expected.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
};

/**
 * Synchronizer-token CSRF protection.
 * Only authenticated sessions carry ambient authority, so tokens are issued and
 * checked for logged-in users only. This avoids creating a session per anonymous visitor.
 * Clients send the token via the `X-CSRF-Token` header (fetch) or a `_csrf` form field.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return next();
    }

    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString("hex");
    }
    res.locals.csrfToken = req.session.csrfToken;

    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    const token = req.get("x-csrf-token") ?? req.body?._csrf;
    if (!tokensMatch(req.session.csrfToken, token)) {
        return next(forbidden("Invalid or missing CSRF token"));
    }

    next();
};
