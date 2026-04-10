import { Router } from 'express';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import { UserService } from '../services/UserService';
import { ManagerAccountController } from '../controllers/managerAccount.controller';

const router = Router();
const userService = new UserService();
const controller = new ManagerAccountController();

router.use(auth(userService));
router.use(adminAuth);

router.post('/', controller.createManager.bind(controller));
router.get('/', controller.listManagers.bind(controller));
router.get('/:id', controller.getManagerById.bind(controller));
router.put('/:id', controller.updateManager.bind(controller));
router.post('/:id/reset-password', controller.resetPassword.bind(controller));
router.delete('/:id', controller.deleteManager.bind(controller));

export default router;
