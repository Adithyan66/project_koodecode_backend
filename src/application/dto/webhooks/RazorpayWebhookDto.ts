export interface RazorpayWebhookPayload {
    entity: string;
    account_id: string;
    event: string;
    contains: string[];
    payload: {
        payment: {
            entity: {
                id: string;
                entity: string;
                amount: number;
                currency: string;
                status: string;
                order_id: string;
                invoice_id: string | null;
                international: boolean;
                method: string;
                amount_refunded: number;
                refund_status: string | null;
                captured: boolean;
                description: string | null;
                card_id: string | null;
                bank: string | null;
                wallet: string | null;
                vpa: string | null;
                email: string;
                contact: string;
                notes: Record<string, any>;
                fee: number;
                tax: number;
                error_code: string | null;
                error_description: string | null;
                created_at: number;
            }
        }
    };
}

export interface WebhookVerificationData {
    payload: any;
    signature: string;
}

