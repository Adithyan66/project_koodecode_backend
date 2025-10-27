import mongoose from 'mongoose';
import { IPaymentGatewayService } from '../../../../domain/interfaces/services/IPaymentGatewayService';
import { ICoinPurchaseRepository } from '../../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { ICoinTransactionRepository } from '../../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { CompletePurchaseDto } from '../../../dto/coins/CoinPurchaseDto';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../../domain/entities/CoinTransaction';
import { CoinPurchase, PaymentMethod, PurchaseStatus } from '../../../../domain/entities/CoinPurchase';
import { inject, injectable } from 'tsyringe';
import { ICompleteCoinPurchaseUseCase } from '../../../interfaces/ICoinUseCase';
import { 
  InvalidPaymentSignatureError,
  PaymentOrderNotFoundError,
  PaymentAlreadyCompletedError,
  CoinPurchaseCompletionError,
  UserProfileNotFoundError,
  CoinBalanceUpdateError,
  TransactionRecordingError,
  PurchaseRecordUpdateError,
  PaymentNotCapturedError,
  PaymentAmountMismatchError
} from '../../../../domain/errors/CoinErrors';
import { MissingFieldsError } from '../../../../domain/errors/AuthErrors';

@injectable()
export class CompleteCoinPurchaseUseCase implements ICompleteCoinPurchaseUseCase {

    constructor(
        @inject("IPaymentGatewayService") private paymentGatewayService: IPaymentGatewayService,
        @inject("ICoinPurchaseRepository") private coinPurchaseRepository: ICoinPurchaseRepository,
        @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository,
        @inject("ICoinTransactionRepository") private coinTransactionRepository: ICoinTransactionRepository
    ) { }

    async execute(dto: CompletePurchaseDto): Promise<{ message: string; coins: number; paymentMethod: string }> {

        this.validateDto(dto);

        const isValidSignature = await this.paymentGatewayService.verifyPaymentSignature(
            dto.orderId,
            dto.paymentId,
            dto.signature
        );

        if (!isValidSignature) {
            throw new InvalidPaymentSignatureError();
        }

        const purchase = await this.coinPurchaseRepository.findByExternalOrderId(dto.orderId);
        if (!purchase) {
            throw new PaymentOrderNotFoundError(dto.orderId);
        }

        if (purchase.isCompleted()) {
            throw new PaymentAlreadyCompletedError(dto.orderId);
        }

        try {
          
            const paymentDetails = await this.paymentGatewayService.getPaymentDetails(dto.paymentId);
            
            if (!paymentDetails) {
                throw new PaymentNotCapturedError();
            }

        
            if (paymentDetails.status !== 'captured') {
                throw new PaymentNotCapturedError();
            }


            if (Math.abs(paymentDetails.amount - purchase.amount) > 0.01) {
                throw new PaymentAmountMismatchError();
            }

            const paymentMethod = this.mapRazorpayMethodToPaymentMethod(paymentDetails.method);
            const paymentMethodDetails = this.extractPaymentMethodDetails(paymentDetails.method, dto.paymentId);

            await this.completePurchaseTransaction(dto, purchase, {
                paymentMethod,
                paymentMethodDetails,
                razorpayOrderStatus: paymentDetails.status,
                ipAddress: dto.ipAddress,
                userAgent: dto.userAgent
            });

            return {
                message: `Successfully added ${purchase.coins} coins to your account`,
                coins: purchase.coins,
                paymentMethod: paymentMethod || PaymentMethod.CARD
            };

        } catch (error) {
            await this.markPurchaseAsFailed(purchase, error instanceof Error ? error.message : 'Unknown error');
            
            if (error instanceof InvalidPaymentSignatureError ||
                error instanceof PaymentOrderNotFoundError ||
                error instanceof PaymentAlreadyCompletedError ||
                error instanceof UserProfileNotFoundError ||
                error instanceof CoinBalanceUpdateError ||
                error instanceof TransactionRecordingError ||
                error instanceof PurchaseRecordUpdateError ||
                error instanceof PaymentNotCapturedError ||
                error instanceof PaymentAmountMismatchError) {
                throw error;
            }
            
            throw new CoinPurchaseCompletionError(error instanceof Error ? error.message : 'Unknown error');
        }
    }

    private validateDto(dto: CompletePurchaseDto): void {
        const missingFields: string[] = [];
        
        if (!dto.orderId) missingFields.push("orderId");
        if (!dto.paymentId) missingFields.push("paymentId");
        if (!dto.signature) missingFields.push("signature");

        if (missingFields.length > 0) {
            throw new MissingFieldsError(missingFields);
        }
    }

    private async completePurchaseTransaction(
        dto: CompletePurchaseDto, 
        purchase: CoinPurchase,
        paymentInfo: { paymentMethod: PaymentMethod; paymentMethodDetails: Record<string, any>; razorpayOrderStatus: string; ipAddress?: string; userAgent?: string }
    ): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update purchase record with all details
            purchase.externalPaymentId = dto.paymentId;
            purchase.paymentMethod = paymentInfo.paymentMethod;
            purchase.paymentMethodDetails = paymentInfo.paymentMethodDetails;
            purchase.razorpayOrderStatus = paymentInfo.razorpayOrderStatus;
            if (paymentInfo.ipAddress) purchase.ipAddress = paymentInfo.ipAddress;
            if (paymentInfo.userAgent) purchase.userAgent = paymentInfo.userAgent;
            purchase.markAsCompleted();

            await this.coinPurchaseRepository.update(purchase.id!, purchase);

            // Get user profile and update balance
            const userProfile = await this.userProfileRepository.findByUserId(purchase.userId);
            if (!userProfile) {
                throw new UserProfileNotFoundError(purchase.userId);
            }

            userProfile.coinBalance += purchase.coins;
            await this.userProfileRepository.update(purchase.userId, {
                coinBalance: userProfile.coinBalance
            });

            // Record coin transaction
            const coinTransaction = new CoinTransaction({
                userId: purchase.userId,
                amount: purchase.coins,
                type: CoinTransactionType.EARN,
                source: CoinTransactionSource.PREMIUM_UPGRADE,
                description: `Purchased ${purchase.coins} coins for ₹${purchase.amount} via ${paymentInfo.paymentMethod}`,
                metadata: {
                    purchaseId: purchase.id,
                    paymentId: dto.paymentId,
                    orderId: dto.orderId,
                    amount: purchase.amount,
                    paymentMethod: paymentInfo.paymentMethod,
                    paymentMethodDetails: paymentInfo.paymentMethodDetails
                }
            });

            await this.coinTransactionRepository.create(coinTransaction);

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
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

    private extractPaymentMethodDetails(method: string, paymentId: string): Record<string, any> {
        return {
            method,
            paymentId,
            provider: 'razorpay'
        };
    }

    private async markPurchaseAsFailed(purchase: CoinPurchase, reason: string): Promise<void> {
        try {
            purchase.markAsFailed(reason);
            await this.coinPurchaseRepository.update(purchase.id!, purchase);
        } catch (error) {
            // Log error but don't throw - this is cleanup
            console.error(`Failed to mark purchase ${purchase.id} as failed:`, error);
        }
    }
}
