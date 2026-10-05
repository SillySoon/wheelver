// src/routes/userRoutes.ts
import { Router } from "express";
import * as userController from "../controllers/userController";
import { isOwnerOrAdmin } from "../middleware/authMiddleware";

const router: Router = Router();

// Routes of /api/user
router.get("/me", userController.getMe);
router.get("/", userController.getUsers);
router.get("/:id", userController.getUser);
router.delete("/:id", isOwnerOrAdmin, userController.deleteUser);

export default router;
