// src/routes/collectionRoutes.ts
import { Router } from 'express';
import * as collectionController from '../controllers/collectionController';

const router: Router = Router();

// Routes of /api/collection
router.post('/', collectionController.createCollection);
router.get('/', collectionController.getCollections);
router.get('/:id', collectionController.getCollection);
router.put('/:id', collectionController.updateCollection);
router.delete('/:id', collectionController.deleteCollection);
router.post('/:id/hotwheel/:hotwheelId', collectionController.addHotwheel);
router.delete('/:id/hotwheel/:hotwheelId', collectionController.removeHotwheel);

export default router;