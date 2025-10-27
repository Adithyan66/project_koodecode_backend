import mongoose from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { IPaymentGatewayService } from '../../../domain/interfaces/services/IPaymentGatewayService';
import { ICoinPurchaseRepository } from '../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { CoinPurchase, PaymentMethod } from '../../../domain/entities/CoinPurchase';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';
import { RazorpayWebhookPayload } from '../../dto/webhooks/RazorpayWebhookDto';
import crypto from 'crypto';
import { config } from '../../../infrastructure/config/config';
import { 
    WebhookVerificationFailedError,
    PaymentOrderNotFoundError,
    PaymentNotCapturedError,
    PaymentAmountMismatchError,
    UserProfileNotFoundError
} from '../../../domain/errors/CoinErrors';
import { IHandleRazorpayWebhookUseCase } from '../../interfaces/IWebhookUseCase';

@injectable()
export class HandleRazorpayWebhookUseCase implements IHandleRazorpayWebhookUseCase {
    
    constructor(
        @inject("ICoinPurchaseRepository") private coinPurchaseRepository: ICoinPurchaseRepository,
        @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository,
        @inject("ICoinTransactionRepository") private coinTransactionRepository: ICoinTransactionRepository,
        @inject("IPaymentGatewayService") private paymentGatewayService: IPaymentGatewayService
    ) {}

    async execute(payload: RazorpayWebhookPayload, signature: string): Promise<{ success: boolean; message: string }> {
        try {
            // Verify webhook signature
            const isValidSignature = this.verifyWebhookSignature(payload, signature);
            if (!isValidSignature) {
                throw new WebhookVerificationFailedError();
            }

            const eventType = payload.event;
            const payment = payload.payload.payment.entity;

            // Handle different event types
            if (eventType === 'payment.captured') {
                return await this.handlePaymentCaptured(payment);
            } else if (eventType === 'payment.failed') {
                return await this.handlePaymentFailed(payment);
            }

            return { success: true, message: `Event ${eventType} processed` };

        } catch (error) {
            console.error('Webhook processing error:', error);
            throw error;
        }
    }

    private verifyWebhookSignature(payload: any, signature: string): boolean {
        const payloadString = JSON.stringify(payload);
        const expectedSignature = crypto
            .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
            .update(payloadString)
            .digest('hex');

        return expectedSignature === signature;
    }

    private async handlePaymentCaptured(payment: any): Promise<{ success: boolean; message: string }> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find purchase by order ID
            const purchase = await this.coinPurchaseRepository.findByExternalOrderId(payment.order_id);
            
            if (!purchase) {
                await session.abortTransaction();
                throw new PaymentOrderNotFoundError(payment.order_id);
            }

            // Skip if already completed (idempotency)
            if (purchase.isCompleted()) {
                await session.abortTransaction();
                return { success: true, message: 'Payment already processed' };
            }

            // Map payment method
            const paymentMethod = this.mapRazorpayMethodToPaymentMethod(payment.method);
            const paymentMethodDetails = {
                method: payment.method,
                paymentId: payment.id,
                card: payment.card_id,
                bank: payment.bank,
                wallet: payment.wallet,
                vpa: payment.vpa,
                provider: 'razorpay'
            };

            // Verify payment is captured
            if (!payment.captured) {
                await session.abortTransaction();
                throw new PaymentNotCapturedError();
            }

            // Verify payment amount
            const amountInRupees = payment.amount / 100;
            if (Math.abs(amountInRupees - purchase.amount) > 0.01) {
                await session.abortTransaction();
                throw new PaymentAmountMismatchError();
            }

            // Update purchase
            purchase.externalPaymentId = payment.id;
            purchase.paymentMethod = paymentMethod;
            purchase.paymentMethodDetails = paymentMethodDetails;
            purchase.razorpayOrderStatus = payment.status;
            purchase.webhookVerified = true;
            purchase.markAsCompleted();

            await this.coinPurchaseRepository.update(purchase.id!, purchase);

            // Update user balance
            const userProfile = await this.userProfileRepository.findByUserId(purchase.userId);
            if (!userProfile) {
                await session.abortTransaction();
                throw new UserProfileNotFoundError(purchase.userId);
            }

            userProfile.coinBalance += purchase.coins;
            await this.userProfileRepository.update(purchase.userId, {
                coinBalance: userProfile.coinBalance
            });

            // Record transaction
            const coinTransaction = new CoinTransaction({
                userId: purchase.userId,
                amount: purchase.coins,
                type: CoinTransactionType.EARN,
                source: CoinTransactionSource.PREMIUM_UPGRADE,
                description: `Purchased ${purchase.coins} coins for ₹${purchase.amount} via ${paymentMethod}`,
                metadata: {
                    purchaseId: purchase.id,
                    paymentId: payment.id,
                    orderId: payment.order_id,
                    amount: purchase.amount,
                    paymentMethod: paymentMethod,
                    paymentMethodDetails: paymentMethodDetails,
                    webhookVerified: true,
                    source: 'webhook'
                }
            });

            await this.coinTransactionRepository.create(coinTransaction);
            await session.commitTransaction();

            return { success: true, message: `Payment captured for order ${payment.order_id}` };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    private async handlePaymentFailed(payment: any): Promise<{ success: boolean; message: string }> {
        try {
            const purchase = await this.coinPurchaseRepository.findByExternalOrderId(payment.order_id);
            
            if (!purchase) {
                return { success: false, message: `Purchase not found for order ${payment.order_id}` };
            }

            if (purchase.isCompleted()) {
                return { success: true, message: 'Purchase already completed' };
            }

            // Mark as failed
            purchase.externalPaymentId = payment.id;
            purchase.markAsFailed(payment.error_description || 'Payment failed');
            await this.coinPurchaseRepository.update(purchase.id!, purchase);

            return { success: true, message: `Payment failed for order ${payment.order_id}` };

        } catch (error) {
            console.error('Error handling failed payment:', error);
            return { success: false, message: 'Failed to process payment failure' };
        }
    }

    private mapRazorpayMethodToPaymentMethod(razorpayMethod: string): PaymentMethod {
        const methodLower = razorpayMethod.toLowerCase();
        
        if (methodLower === 'upi' || methodLower.includes('upi')) {
            return PaymentMethod.UPI;
        } else if (methodLower === 'card' || methodLower.includes('card')) {
            return PaymentMethod.CARD;
        } else if (methodLower === 'netbanking' || methodLower === 'net_banking') {
            return PaymentMethod.NET_BANKING;
        } else if (methodLower === 'wallet') {
            return PaymentMethod.WALLET;
        } else if (methodLower === 'emi') {
            return PaymentMethod.EMI;
        } else {
            return PaymentMethod.CARD;
        }
    }
}

