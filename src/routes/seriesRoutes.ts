// src/routes/seriesRoutes.ts
import { Router } from 'express';
import * as seriesController from '../controllers/seriesController';

const router: Router = Router();

// Routes of /api/series
router.post('/', seriesController.createSeries);
router.get('/', seriesController.getAllSeries);
router.get('/:id', seriesController.getSeries);
router.put('/:id', seriesController.updateSeries);
router.delete('/:id', seriesController.deleteSeries);

export default router;