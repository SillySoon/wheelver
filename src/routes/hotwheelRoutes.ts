// src/routes/hotwheelRoutes.ts
import { Router } from "express";
import { isAdmin } from "../middleware/authMiddleware";
import * as hotwheelController from "../controllers/hotwheelController";

const router: Router = Router();

// Routes of /api/hotwheel
router.post("/", isAdmin, hotwheelController.createHotwheel);
router.get("/", hotwheelController.getHotwheels);
router.get("/:id", hotwheelController.getHotwheel);
router.put("/:id", isAdmin, hotwheelController.updateHotwheel);
router.delete("/:id", isAdmin, hotwheelController.deleteHotwheel);

export default router;
