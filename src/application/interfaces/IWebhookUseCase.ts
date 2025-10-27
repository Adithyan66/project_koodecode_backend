import { RazorpayWebhookPayload } from '../dto/webhooks/RazorpayWebhookDto';

export interface IHandleRazorpayWebhookUseCase {
    execute(payload: RazorpayWebhookPayload, signature: string): Promise<{ success: boolean; message: string }>;
}

