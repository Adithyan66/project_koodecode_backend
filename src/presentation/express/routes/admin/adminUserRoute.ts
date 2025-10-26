import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { AdminUserController } from '../../../http/controllers/admin/AdminUserController';
import { adminOnly } from '../../middlewares';

const router = Router();
const adminUserController = container.resolve(AdminUserController);

router.get('/', adminOnly, expressAdapter(adminUserController.getAllUsers));
router.get('/:userId', adminOnly, expressAdapter(adminUserController.getUserProfile));
router.get('/:userId/contests', adminOnly, expressAdapter(adminUserController.getUserContestData));
router.patch('/:userId/block', adminOnly,expressAdapter( adminUserController.blockUser));
export default router;
