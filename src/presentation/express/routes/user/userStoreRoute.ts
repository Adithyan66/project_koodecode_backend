





import { Router } from 'express';
import { container } from 'tsyringe';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { UserStoreController } from '../../../http/controllers/user/UserStoreController';
import { authenticate } from '../../middlewares';



const router = Router();

const userStoreController = container.resolve(UserStoreController)


router.get('/items', authenticate, expressAdapter(userStoreController.getStoreItems));
router.post('/purchase', authenticate, expressAdapter(userStoreController.purchaseItem));
router.get('/inventory', authenticate, expressAdapter(userStoreController.getUserInventory));
router.get('/ownership/:itemId', authenticate, expressAdapter(userStoreController.checkItemOwnership));
router.post('/use-time-travel-ticket', authenticate, expressAdapter(userStoreController.useTimeTravelTicket));
router.get('/missed-days', authenticate, expressAdapter(userStoreController.getMissedDays));



export default router;
