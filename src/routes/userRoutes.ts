// src/routes/userRoutes.ts
import { Router } from 'express';
import * as userController from '../controllers/userController';
import { isAdmin, isOwner, isOwnerOrAdmin } from '../middleware/authMiddleware';

const router: Router = Router();

// Routes of /api/user
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: "Not authenticated" });
    }
});
router.post('/', isAdmin, userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', isOwner, userController.updateUser);
router.delete('/:id', isOwnerOrAdmin, userController.deleteUser);

export default router;