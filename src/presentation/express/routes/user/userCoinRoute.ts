

import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { UserCoinController } from '../../../http/controllers/user/UserCoinController';
import { authenticate } from '../../middlewares';



const router = Router();
const userCoinController = container.resolve(UserCoinController);




router.post('/create-order', authenticate, expressAdapter(userCoinController.createOrder));
router.post('/complete', authenticate, expressAdapter(userCoinController.completePurchase));
router.get('/balance', authenticate, expressAdapter(userCoinController.getBalance));
router.get('/transactions', authenticate, expressAdapter(userCoinController.getTransactions));
router.get('/stats', authenticate, expressAdapter(userCoinController.getStats));



export default router;


