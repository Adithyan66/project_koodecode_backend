export interface PaymentVerificationData {
    orderId: string;
    paymentId: string;
    signature: string;
}

/**
 * Adapter to normalize payment verification data from different payment gateways
 * Supports Razorpay field names and generic field names
 */
export class PaymentDataAdapter {
    /**
     * Normalizes payment data from various payment gateway formats
     * @param data - Raw payment data from request body
     * @returns Normalized payment verification data
     */
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

    /**
     * Validates payment data before processing
     * @param data - Payment data to validate
     * @returns true if valid
     */
    static isValidPaymentData(data: any): boolean {
        const hasGenericFields = !!(data.orderId && data.paymentId && data.signature);
        const hasRazorpayFields = !!(data.razorpay_order_id && data.razorpay_payment_id && data.razorpay_signature);
        
        return hasGenericFields || hasRazorpayFields;
    }
}

