// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { ADMIN_DISCORD_IDS } from '../config/env';
import { isValidObjectId } from '../utils/validation';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login'); // Or wherever your login page is
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!ADMIN_DISCORD_IDS.includes((req.user as any).discordId)) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
};

export const isOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as any;
    if (user._id.toString() !== req.params.id && !ADMIN_DISCORD_IDS.includes(user.discordId)) {
        return res.status(403).json({ message: "Forbidden: You do not own this resource" });
    }

    next();
};

export const isOwner = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = (req.user as any)._id.toString();
    const resourceId = req.params.id;

    if (userId !== resourceId) {
        return res.status(403).json({ message: "Forbidden: You do not own this resource" });
    }

    next();
};

export const isCollectionOwner = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = (req.user as any)._id.toString();
    const collectionId = req.params.id as string;

    if (!isValidObjectId(collectionId)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const { Collection } = require('../models');
        const collection = await Collection.findById(collectionId);

        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }

        if (collection.owner.toString() !== userId) {
            return res.status(403).json({ message: "Forbidden: You do not own this collection" });
        }

        next();
    } catch (error: any) {
        console.error("Collection ownership check failed:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
