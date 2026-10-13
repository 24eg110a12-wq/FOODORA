import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, reorder } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/reorder', reorder);

export default router;
