import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';

const router = Router();
router.get('/stats', ctrl.getStats);
export default router;
