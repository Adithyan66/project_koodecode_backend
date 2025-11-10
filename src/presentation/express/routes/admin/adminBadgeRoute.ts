import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from '../../../../infrastructure/config/container';
import { AdminBadgeController } from '../../../http/controllers/admin/AdminBadgeController';
import { adminOnly } from '../../middlewares';

const router = Router();
const adminBadgeController = container.resolve(AdminBadgeController);

router.get('/', adminOnly, expressAdapter(adminBadgeController.listBadges));
router.get('/:badgeId', adminOnly, expressAdapter(adminBadgeController.getBadgeById));
router.patch('/:badgeId', adminOnly, expressAdapter(adminBadgeController.updateBadge));
router.patch('/:badgeId/status', adminOnly, expressAdapter(adminBadgeController.toggleBadgeStatus));
router.get('/:badgeId/holders', adminOnly, expressAdapter(adminBadgeController.listBadgeHolders));

export default router;
