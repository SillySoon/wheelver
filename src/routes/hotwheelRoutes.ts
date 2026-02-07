// src/routes/hotwheelRoutes.ts
import { Router } from 'express';
import * as hotwheelController from '../controllers/hotwheelController';

const router: Router = Router();

// Routes of /api/hotwheel
router.post('/', hotwheelController.createHotwheel);
router.get('/', hotwheelController.getHotwheels);
router.get('/:id', hotwheelController.getHotwheel);
router.put('/:id', hotwheelController.updateHotwheel);
router.delete('/:id', hotwheelController.deleteHotwheel);

export default router;