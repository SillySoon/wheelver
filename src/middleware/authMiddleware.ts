// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { ADMIN_DISCORD_IDS } from "../config/env";
import { Collection } from "../models";
import { forbidden, notFound, unauthorized } from "../errors/HttpError";
import { asyncHandler } from "../handlers/asyncHandler";
import { idParams, parse } from "../validation/schemas";

/** Returns the logged-in user or throws 401. */
export const requireUser = (req: Request): Express.User => {
    if (!req.isAuthenticated() || !req.user) {
        throw unauthorized();
    }
    return req.user;
};

export const isAdminUser = (user: Express.User | undefined) => !!user && ADMIN_DISCORD_IDS.includes(user.discordId);

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // Pages send visitors to the login, the API answers with 401
    if (req.originalUrl.startsWith("/api")) {
        return next(unauthorized());
    }
    res.redirect("/auth/login");
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = requireUser(req);
    if (!isAdminUser(user)) {
        throw forbidden("Forbidden: Admin access required");
    }
    next();
};

export const isOwner = (req: Request, res: Response, next: NextFunction) => {
    const user = requireUser(req);
    if (user._id.toString() !== req.params.id) {
        throw forbidden("Forbidden: You do not own this resource");
    }
    next();
};

export const isOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = requireUser(req);
    if (user._id.toString() !== req.params.id && !isAdminUser(user)) {
        throw forbidden("Forbidden: You do not own this resource");
    }
    next();
};

export const isCollectionOwner = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = requireUser(req);
    const { id } = parse(idParams, req.params);

    const collection = await Collection.findById(id).select("owner").lean();
    if (!collection) {
        throw notFound("Collection not found");
    }
    if (collection.owner.toString() !== user._id.toString()) {
        throw forbidden("Forbidden: You do not own this collection");
    }
    next();
});
