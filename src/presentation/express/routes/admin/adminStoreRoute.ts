import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { AdminStoreController } from '../../../http/controllers/admin/AdminStoreController';
import { adminOnly } from '../../middlewares';

const router = Router();
const adminStoreController = container.resolve(AdminStoreController);

router.get('/items', adminOnly, expressAdapter(adminStoreController.getAllStoreItems));
router.patch('/:itemId', adminOnly, expressAdapter(adminStoreController.updateStoreItem));
router.patch('/:itemId/toggle-active', adminOnly, expressAdapter(adminStoreController.toggleStoreItemActive));

export default router;

