import { Router } from 'express';
import ordersRoutes    from './orders';
import dashboardRoutes from './dashboard';
import returnsRoutes   from './returns';
import slaRoutes       from './sla';
import seedRoutes      from './seed';

const router = Router();

router.use('/orders',    ordersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/returns',   returnsRoutes);
router.use('/sla',       slaRoutes);
router.use('/seed',      seedRoutes);

export default router;
