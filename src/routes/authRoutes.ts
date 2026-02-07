// src/routes/authRoutes.ts
import { Router } from 'express';
import passport from 'passport';
import path from 'path';
import User from '../models/User';
import { IUser } from '../interfaces/IUser';

const router = Router();

// Route to start Discord authentication
router.get('/discord', passport.authenticate('discord'));

// Callback route after Discord authentication
router.get('/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        const user = req.user as IUser;
        if (user && !user.isRegistered) {
            return res.redirect('/auth/register');
        }
        // Successful authentication, redirect to home or profile.
        res.redirect('/');
    }
);

// Registration routes
router.get('/register', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/discord');
    }
    const user = req.user as IUser;
    if (user.isRegistered) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '..', 'views', 'auth', 'register.html'));
});

router.post('/register', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send('Unauthorized');
    }
    const user = req.user as IUser;
    if (user.isRegistered) {
        return res.redirect('/');
    }

    const { username } = req.body;
    if (!username || username.length < 3) {
        return res.redirect('/auth/register?error=Username too short');
    }

    try {
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.redirect('/auth/register?error=Username already taken');
        }

        user.username = username;
        user.isRegistered = true;
        await user.save();

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/auth/register?error=An error occurred');
    }
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user as IUser;
        if (user.isRegistered) {
            return res.redirect('/');
        } else {
            return res.redirect('/auth/register');
        }
    }
    res.sendFile(path.join(__dirname, '..', 'views', 'auth', 'login.html'));
});

// Logout route
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

export default router;
