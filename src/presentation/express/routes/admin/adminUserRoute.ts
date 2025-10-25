import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { AdminUserController } from '../../../http/controllers/admin/AdminUserController';
import { adminOnly } from '../../middlewares';

const router = Router();
const adminUserController = container.resolve(AdminUserController);

router.get('/users', adminOnly, expressAdapter(adminUserController.getAllUsers));

export default router;
