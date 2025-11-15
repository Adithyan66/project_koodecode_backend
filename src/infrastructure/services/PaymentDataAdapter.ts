export interface PaymentVerificationData {
    orderId: string;
    paymentId: string;
    signature: string;
}


export class PaymentDataAdapter {
  
    static normalizePaymentData(data: any): PaymentVerificationData {
        const orderId = data.orderId || data.razorpay_order_id;
        const paymentId = data.paymentId || data.razorpay_payment_id;
        const signature = data.signature || data.razorpay_signature;

        if (!orderId || !paymentId || !signature) {
            const missingFields: string[] = [];
            if (!orderId) missingFields.push("orderId/razorpay_order_id");
            if (!paymentId) missingFields.push("paymentId/razorpay_payment_id");
            if (!signature) missingFields.push("signature/razorpay_signature");
            throw new Error(`Missing payment verification fields: ${missingFields.join(", ")}`);
        }

        return {
            orderId,
            paymentId,
            signature
        };
    }

    static isValidPaymentData(data: any): boolean {
        const hasGenericFields = !!(data.orderId && data.paymentId && data.signature);
        const hasRazorpayFields = !!(data.razorpay_order_id && data.razorpay_payment_id && data.razorpay_signature);
        
        return hasGenericFields || hasRazorpayFields;
    }
}

