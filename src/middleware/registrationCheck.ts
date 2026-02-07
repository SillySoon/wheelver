// src/middleware/registrationCheck.ts
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../interfaces/IUser';

export const ensureRegistered = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        const user = req.user as IUser;
        if (!user.isRegistered) {
            // Check if we are not already on an auth route to avoid infinite redirect
            if (!req.path.startsWith('/auth')) {
                return res.redirect('/auth/register');
            }
        }
    }
    next();
};

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};
