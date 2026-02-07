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

    const user = req.user as any;
    const collectionId = req.params.id;

    // Check if the collectionId is in the user's collections
    // This assumes user.collections is an array of IDs or objects with _id
    const hasCollection = user.collections.some((c: any) => {
        const id = c._id ? c._id.toString() : c.toString();
        return id === collectionId;
    });

    if (!hasCollection) {
        return res.status(403).json({ message: "Forbidden: You do not own this collection" });
    }

    next();
};
