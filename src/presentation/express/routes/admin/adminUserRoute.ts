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
router.get('/:userId/submissions', adminOnly, expressAdapter(adminUserController.getUserSubmissionData));
router.get('/:userId/financial', adminOnly, expressAdapter(adminUserController.getUserFinancialData));
router.get('/:userId/store', adminOnly, expressAdapter(adminUserController.getUserStoreData));
router.get('/:userId/rooms', adminOnly, expressAdapter(adminUserController.getUserRoomData));
router.patch('/:userId/block', adminOnly,expressAdapter( adminUserController.blockUser));
router.patch('/:userId/reset-password', adminOnly, expressAdapter(adminUserController.resetUserPassword));
router.post('/:userId/send-mail', adminOnly, expressAdapter(adminUserController.sendMailToUser));
export default router;
