import { Router } from 'express';
import { auth } from '../middleware/auth';
import { superAdminAuth } from '../middleware/adminAuth';
import { UserService } from '../services/UserService';
import { ProductManagerController } from '../controllers/productManager.controller';

const router = Router();
const userService = new UserService();
const controller = new ProductManagerController();

// All routes require authentication and super admin privileges
router.use(auth(userService));
router.use(superAdminAuth);

// Product Manager CRUD routes
router.post('/', controller.createProductManager.bind(controller));
router.get('/', controller.listProductManagers.bind(controller));
router.get('/:id', controller.getProductManagerById.bind(controller));
router.put('/:id', controller.updateProductManager.bind(controller));
router.post('/:id/reset-password', controller.resetPassword.bind(controller));
router.delete('/:id', controller.deleteProductManager.bind(controller));

export default router;
