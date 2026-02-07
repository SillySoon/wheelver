// src/routes/viewRoutes.ts
import { Router } from "express";
import { isAuthenticated, isOwner, isCollectionOwner } from "../middleware/authMiddleware";

const router: Router = Router();

router.get("/", (req, res) => {
    res.render("site/home");
});

router.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("site/dashboard");
});

router.get("/dashboard/u/:id", isOwner, (req, res) => {
    res.render("site/dashboard_user");
});

router.get("/dashboard/c/:id", isCollectionOwner, (req, res) => {
    res.render("site/dashboard_collection");
});

router.get("/u/:id", (req, res) => {
    res.render("site/user");
});

router.get("/c/:id", (req, res) => {
    res.render("site/collection");
});

router.get("/hw/:id", (req, res) => {
    res.render("site/hotwheel");
});

export default router;
