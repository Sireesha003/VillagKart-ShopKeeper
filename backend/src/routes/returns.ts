import { Router } from 'express';
import * as ctrl from '../controllers/returns.controller';

const router = Router();
router.get('/',              ctrl.getReturns);
router.post('/',             ctrl.createReturn);
router.put('/:id/approve',   ctrl.approveReturn);
export default router;
