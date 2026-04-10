import { Router } from 'express';
import { auth } from '../middleware/auth';
import { orderManagerAuth } from '../middleware/adminAuth';
import { UserService } from '../services/UserService';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const userService = new UserService();
const adminController = new AdminController();

router.use(auth(userService));
router.use(orderManagerAuth);

router.get('/orders', adminController.getOrders);
router.get('/orders/stats', adminController.getOrderStats);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.post('/orders/:id/cancel', adminController.cancelOrder);
router.post('/orders/:id/refund', adminController.processRefund);
router.put('/orders/:id/refund', adminController.refundOrder);

export default router;
