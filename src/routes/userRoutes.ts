// src/routes/userRoutes.ts
import { Router } from 'express';
import * as userController from '../controllers/userController';

const router: Router = Router();

// Routes of /api/user
router.get('/', userController.getUser);

export default router;