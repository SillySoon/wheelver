// src/routes/apiRoutes.ts
import userRoutes from './userRoutes';
import seriesRoutes from './seriesRoutes';
import hotwheelRoutes from './hotwheelRoutes';
import collectionRoutes from './collectionRoutes';
import { Router } from 'express';

const router: Router = Router();

// Routes of /api
router.use('/user', userRoutes);
router.use('/series', seriesRoutes);
router.use('/hotwheel', hotwheelRoutes);
router.use('/collection', collectionRoutes);

export default router;