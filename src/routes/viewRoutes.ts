// src/routes/viewRoutes.ts
import { Router } from "express";
import path from "path";
import { isAuthenticated, isOwner, isCollectionOwner } from "../middleware/authMiddleware";

const router: Router = Router();

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/partials/header.html", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "partials", "header.html"));
});

router.get("/dashboard", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "dashboard", "index.html"));
});

router.get("/dashboard/u/:id", isOwner, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "dashboard", "u", "edit.html"));
});

router.get("/dashboard/c/:id", isCollectionOwner, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "dashboard", "c", "edit.html"));
});

router.get("/u/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "u", "index.html"));
});

router.get("/c/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "c", "index.html"));
});

router.get("/hw/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "hw", "index.html"));
});

export default router;
