

import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { adminOnly } from '../../middlewares';
import { AdminCoinController } from '../../../http/controllers/admin/AdminCoinController';

const router = Router();

const adminCoinController = container.resolve(AdminCoinController);

router.post('/award', adminOnly, expressAdapter(adminCoinController.awardCoins));
router.get('/purchases', adminOnly, expressAdapter(adminCoinController.getCoinPurchases));
router.get('/purchases/:purchaseId', adminOnly, expressAdapter(adminCoinController.getCoinPurchaseDetail));
router.patch('/purchases/:purchaseId/reconcile', adminOnly, expressAdapter(adminCoinController.reconcilePurchase));
router.post('/purchases/:purchaseId/refund', adminOnly, expressAdapter(adminCoinController.refundPurchase));
router.patch('/purchases/:purchaseId/notes', adminOnly, expressAdapter(adminCoinController.addNoteToPurchase));


export default router;
