// src/routes/userRoutes.ts
import { Router } from 'express';
import * as userController from '../controllers/userController';

const router: Router = Router();

// Routes of /api/user
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/collection/:collectionId', userController.addCollection);
router.delete('/:id/collection/:collectionId', userController.removeCollection);

export default router;