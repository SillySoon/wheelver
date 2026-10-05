// src/routes/seriesRoutes.ts
import { Router } from "express";
import { isAdmin } from "../middleware/authMiddleware";
import * as seriesController from "../controllers/seriesController";

const router: Router = Router();

// Routes of /api/series
router.post("/", isAdmin, seriesController.createSeries);
router.get("/", seriesController.getAllSeries);
router.get("/:id", seriesController.getSeries);
router.put("/:id", isAdmin, seriesController.updateSeries);
router.delete("/:id", isAdmin, seriesController.deleteSeries);

export default router;
