import Razorpay from 'razorpay';
import crypto from 'crypto';
import { IPaymentGatewayService, PaymentDetails } from '../../domain/interfaces/services/IPaymentGatewayService';
import { PaymentOrder } from '../../domain/entities/PaymentOrder';
import { config } from '../config/config';

export class RazorpayGatewayService implements IPaymentGatewayService {
    private razorpay: Razorpay;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: config.RAZORPAY_KEY_ID,
            key_secret: config.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(amount: number, currency: string, receipt: string, metadata?: Record<string, any>): Promise<PaymentOrder> {
        const order = await this.razorpay.orders.create({
            amount: amount * 100,
            currency,
            receipt,
            notes: metadata || {}
        });
        console.log("orderrrrrrrrrrrrrrrrrrrrr", order)
        return new PaymentOrder({
            orderId: order.id,
            amount: Number(order.amount) / 100,
            currency: order.currency,
            receipt: order.receipt!,
            metadata: order.notes,
            key: config.RAZORPAY_KEY_ID
        });
    }

    async verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
        const text = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        return expectedSignature === signature;
    }

    async getPaymentDetails(paymentId: string): Promise<PaymentDetails | null> {
        try {
            const payment = await this.razorpay.payments.fetch(paymentId);

            return {
                paymentId: payment.id,
                orderId: payment.order_id,
                amount: Number(payment.amount) / 100,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                createdAt: new Date(payment.created_at * 1000)
            };
        } catch (error) {
            return null;
        }
    }

    async processRefund(paymentId: string, amount: number, notes?: string): Promise<{ refundId: string; status: string; amount: number }> {
        try {
            const refundData: any = {
                amount: amount * 100
            };

            if (notes) {
                refundData.notes = {
                    reason: 'Refund request',
                    notes: notes
                };
            }

            const refund = await this.razorpay.payments.refund(paymentId, refundData);
            console.log('refunddddddddddddddddddd',refund);
            
            return {
                refundId: refund.id || '',
                status: refund.status || 'processed',
                amount: Number(refund.amount) / 100
            };
        } catch (error) {
            console.error('Razorpay refund error:', error);
            throw new Error(`Failed to process refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
