// src/routes/authRoutes.ts
import { Router } from "express";
import passport from "passport";

const router = Router();

// Route to start Discord authentication
router.get("/discord", passport.authenticate("discord"));

// Callback route after Discord authentication
router.get("/discord/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/dashboard");
});

router.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }
    res.render("auth/login");
});

// Logout route
router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

export default router;
