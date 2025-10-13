

import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { authMiddleware } from '../../../../support/middleware/authMiddleware';
import { container } from "../../../../infrastructure/config/container";
import { UserCoinController } from '../../../http/controllers/user/UserCoinController';



const router = Router();
const userCoinController = container.resolve(UserCoinController);

router.post('/create-order', authMiddleware(), expressAdapter(userCoinController.createOrder));

router.post('/complete', authMiddleware(), expressAdapter(userCoinController.completePurchase));

router.get('/balance', authMiddleware(), expressAdapter(userCoinController.getBalance));

router.get('/transactions', authMiddleware(), expressAdapter(userCoinController.getTransactions));

router.get('/stats', authMiddleware(), expressAdapter(userCoinController.getStats));



export default router;


