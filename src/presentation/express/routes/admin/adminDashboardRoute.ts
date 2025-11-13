import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from '../../../../infrastructure/config/container';
import { AdminDashboardController } from '../../../http/controllers/admin/AdminDashboardController';
import { adminOnly } from '../../middlewares';

const router = Router();
const adminDashboardController = container.resolve(AdminDashboardController);

router.get('/', adminOnly, expressAdapter(adminDashboardController.getDashboard));

export default router;

