

import { PaymentOrder } from '../../entities/PaymentOrder';

export interface IPaymentGatewayService {
    createOrder(amount: number, currency: string, receipt: string, metadata?: Record<string, any>): Promise<PaymentOrder>;
    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean>;
    getPaymentDetails(paymentId: string): Promise<PaymentDetails | null>;
    processRefund(paymentId: string, amount: number, notes?: string): Promise<{ refundId: string; status: string; amount: number }>;
}

export interface PaymentDetails {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    createdAt: Date;
}
