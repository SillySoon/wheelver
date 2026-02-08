// src/routes/collectionRoutes.ts
import { Router } from 'express';
import * as collectionController from '../controllers/collectionController';
import { isAuthenticated, isCollectionOwner } from '../middleware/authMiddleware';

const router: Router = Router();

// Routes of /api/collection
router.post('/', isAuthenticated, collectionController.createCollection);
router.get('/', collectionController.getCollections);
router.get('/:id', collectionController.getCollection);
router.put('/:id', isCollectionOwner, collectionController.updateCollection);
router.delete('/:id', isCollectionOwner, collectionController.deleteCollection);
router.post('/:id/hotwheel/:hotwheelId', isCollectionOwner, collectionController.addHotwheel);
router.delete('/:id/hotwheel/:hotwheelId', isCollectionOwner, collectionController.removeHotwheel);

export default router;