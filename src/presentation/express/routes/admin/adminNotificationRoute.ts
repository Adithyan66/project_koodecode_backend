import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from '../../../../infrastructure/config/container';
import { NotificationController } from '../../../http/controllers/notifications/NotificationController';
import { adminOnly } from '../../middlewares';

const router = Router();
const notificationController = container.resolve(NotificationController);

router.post('/send', adminOnly, expressAdapter(notificationController.sendAdminNotification));

export default router;

