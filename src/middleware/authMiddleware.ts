// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login'); // Or wherever your login page is
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
    const collectionId = req.params.id;

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
        return res.status(500).json({ message: error.message });
    }
};
