import { Router } from 'express';
import * as ctrl from '../controllers/sla.controller';

const router = Router();
router.get('/', ctrl.getSLAReport);
export default router;
