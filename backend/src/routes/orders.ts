import { Router } from 'express';
import * as ctrl from '../controllers/orders.controller';

const router = Router();

router.get('/',                       ctrl.getOrders);
router.get('/:id',                    ctrl.getOrderById);
router.put('/:id/accept',             ctrl.acceptOrder);
router.put('/:id/reject',             ctrl.rejectOrder);
router.put('/:id/status',             ctrl.updateOrderStatus);
router.put('/:orderId/items/:itemId/pick', ctrl.pickItem);

export default router;
