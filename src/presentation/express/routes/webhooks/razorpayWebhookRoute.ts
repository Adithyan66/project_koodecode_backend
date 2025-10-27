import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from '../../../../infrastructure/config/container';
import { RazorpayWebhookController } from '../../../http/controllers/webhooks/RazorpayWebhookController';

const router = Router();
const razorpayWebhookController = container.resolve(RazorpayWebhookController);


router.post('/razorpay', expressAdapter(razorpayWebhookController.handleWebhook));

export default router;

