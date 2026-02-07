// src/routes/viewRoutes.ts
import { Router } from "express";
import path from "path";

const router: Router = Router();

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "index.html"));
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
