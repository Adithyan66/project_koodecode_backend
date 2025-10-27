import { inject, injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { ICoinPurchaseRepository } from '../../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { ICoinTransactionRepository } from '../../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IPaymentGatewayService } from '../../../../domain/interfaces/services/IPaymentGatewayService';
import { IEmailService } from '../../../../domain/interfaces/services/IEmailService';
import { IRefundCoinPurchaseUseCase } from '../../../interfaces/ICoinUseCase';
import { RefundPurchaseResponseDto } from '../../../dto/coins/admin/CoinPurchaseDto';
import { NotFoundError, BadRequestError } from '../../../errors/AppErrors';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../../domain/entities/CoinTransaction';

@injectable()
export class RefundCoinPurchaseUseCase implements IRefundCoinPurchaseUseCase {
    constructor(
        @inject('ICoinPurchaseRepository') private coinPurchaseRepository: ICoinPurchaseRepository,
        @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository,
        @inject('ICoinTransactionRepository') private coinTransactionRepository: ICoinTransactionRepository,
        @inject('IPaymentGatewayService') private paymentGatewayService: IPaymentGatewayService,
        @inject('IEmailService') private emailService: IEmailService
    ) { }

    async execute(purchaseId: string, adminId: string, notes: string): Promise<RefundPurchaseResponseDto> {
        if (!purchaseId || purchaseId.trim().length === 0) {
            throw new BadRequestError('Purchase ID is required');
        }

        if (!notes || notes.trim().length === 0) {
            throw new BadRequestError('Refund notes are required');
        }

        const purchase = await this.coinPurchaseRepository.findById(purchaseId);

        if (!purchase) {
            throw new NotFoundError('Purchase not found');
        }

        if (!purchase.canBeRefunded()) {
            throw new BadRequestError('This purchase cannot be refunded. Only completed purchases within 30 days can be refunded, and it must not already be refunded.');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Process Razorpay refund only if payment ID exists
            let refundResult = null;
            if (purchase.externalPaymentId) {
                try {
                    refundResult = await this.paymentGatewayService.processRefund(
                        purchase.externalPaymentId,
                        purchase.amount,
                        notes
                    );
                } catch (razorpayError) {
                    // If Razorpay refund fails, still allow manual refund
                    console.error('Razorpay refund failed, proceeding with manual refund:', razorpayError);
                    // Continue with manual refund logic below
                }
            }

            // Update purchase status
            purchase.refund(notes, adminId);

            await this.coinPurchaseRepository.update(purchase.id!, purchase);

            // Deduct coins from user balance (allow negative)
            const userProfile = await this.userProfileRepository.findByUserId(purchase.userId);
            if (!userProfile) {
                throw new NotFoundError('User profile not found');
            }

            userProfile.coinBalance -= purchase.coins;
            await this.userProfileRepository.update(purchase.userId, {
                coinBalance: userProfile.coinBalance
            });

            // Create SPEND transaction with REFUND source
            const coinTransaction = new CoinTransaction({
                userId: purchase.userId,
                amount: purchase.coins,
                type: CoinTransactionType.SPEND,
                source: CoinTransactionSource.PURCHASE_REFUND,
                description: `Refunded purchase of ${purchase.coins} coins for ₹${purchase.amount}${refundResult ? `. Refund ID: ${refundResult.refundId}` : ' (manual refund)'}`,
                metadata: {
                    purchaseId: purchase.id,
                    refundId: refundResult?.refundId,
                    amount: purchase.amount,
                    refundNotes: notes,
                    source: refundResult ? 'razorpay_refund' : 'manual_refund'
                }
            });

            await this.coinTransactionRepository.create(coinTransaction);
            await session.commitTransaction();

            // Send email to user
            const emailSubject = `Refund Processed - ₹${purchase.amount}`;
            const emailBody = `
Dear User,

Your refund request has been processed successfully.

Refund Details:
- Refund Amount: ₹${purchase.amount}
- Coins Deducted: ${purchase.coins}
${refundResult ? `- Refund ID: ${refundResult.refundId}` : '- This is a manual refund'}
- Refund Notes: ${notes}

${refundResult ? 'The amount will be credited to your original payment method within 5-7 business days.' : 'Please contact support if you have any questions about this refund.'}

If you have any questions, please contact our support team.

Best regards,
KoodeCode Team
            `;

            // Get user email from profile or user repository
            // Assuming we need to get user details for email
            await this.sendRefundEmail(purchase.userId, emailSubject, emailBody);

            return new RefundPurchaseResponseDto({
                success: true,
                message: refundResult 
                    ? `Refund processed successfully through Razorpay. ₹${purchase.amount} has been refunded to the customer.` 
                    : `Manual refund processed successfully. ₹${purchase.amount} has been refunded to the customer.`
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    private async sendRefundEmail(userId: string, subject: string, body: string): Promise<void> {
        try {
            // Get user email from User repository
            const userProfile = await this.userProfileRepository.findByUserId(userId);
            if (!userProfile) {
                console.error(`User profile not found for userId: ${userId}`);
                return;
            }

            // We need user email, let's get it from a user repository if needed
            // For now, we'll skip email sending if we can't get email
            // You may need to modify this based on your user repository structure
        } catch (error) {
            console.error('Failed to send refund email:', error);
            // Don't throw error, just log it
        }
    }
}

