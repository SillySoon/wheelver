// src/routes/viewRoutes.ts
import { Router } from "express";
import { isAuthenticated, isOwner, isCollectionOwner } from "../middleware/authMiddleware";
import * as viewController from "../controllers/viewController";

const router: Router = Router();

router.get("/", viewController.home);
router.get("/dashboard", isAuthenticated, viewController.dashboard);
router.get("/dashboard/u/:id", isOwner, viewController.account);
router.get("/dashboard/c/:id", isCollectionOwner, viewController.editCollection);
router.get("/u/:handle", viewController.profile);
router.get("/c/:id", viewController.collection);
router.get("/hw/:id", viewController.hotwheel);

export default router;
