import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from '../../../../infrastructure/config/container';
import { NotificationController } from '../../../http/controllers/notifications/NotificationController';
import { authenticate } from '../../middlewares';

const router = Router();
const notificationController = container.resolve(NotificationController);

router.post('/subscribe', authenticate, expressAdapter(notificationController.subscribeToPush));
router.delete('/unsubscribe', authenticate, expressAdapter(notificationController.unsubscribeFromPush));
router.get('/vapid-public-key', expressAdapter(notificationController.getVapidPublicKey));

export default router;

