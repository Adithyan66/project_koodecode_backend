

import { IPaymentGatewayService } from '../../../domain/interfaces/services/IPaymentGatewayService';
import { ICoinPurchaseRepository } from '../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { CompletePurchaseDto } from '../../dto/coins/CoinPurchaseDto';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';
import { AppError } from '../../../shared/exceptions/AppError';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';

export class CompleteCoinPurchaseUseCase {
    constructor(
        private paymentGatewayService: IPaymentGatewayService,
        private coinPurchaseRepository: ICoinPurchaseRepository,
        private userProfileRepository: IUserProfileRepository,
        private coinTransactionRepository: ICoinTransactionRepository
    ) {}

    async execute(dto: CompletePurchaseDto): Promise<{ success: boolean; message: string; coins: number }> {

        const isValidSignature = await this.paymentGatewayService.verifyPaymentSignature(
            dto.orderId,
            dto.paymentId,
            dto.signature
        );

        if (!isValidSignature) {
            throw new AppError('Invalid payment signature', HTTP_STATUS.BAD_REQUEST);
        }

        const purchase = await this.coinPurchaseRepository.findByExternalOrderId(dto.orderId);
        if (!purchase) {
            throw new AppError('Purchase record not found', HTTP_STATUS.NOT_FOUND);
        }

        if (purchase.isCompleted()) {
            return { 
                success: true, 
                message: 'Purchase already completed', 
                coins: purchase.coins 
            };
        }
        console.log("payment detailssssssssssssssssssssssssssssssssssss",purchase);
        

        try {

            purchase.externalPaymentId = dto.paymentId;
            purchase.markAsCompleted();
            await this.coinPurchaseRepository.update(purchase.id!, purchase);

            const userProfile = await this.userProfileRepository.findByUserId(purchase.userId);
            if (!userProfile) {
                throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
            }

            userProfile.coinBalance += purchase.coins;
            await this.userProfileRepository.update(purchase.userId, {
                coinBalance: userProfile.coinBalance
            });

            const coinTransaction = new CoinTransaction({
                userId: purchase.userId,
                amount: purchase.coins,
                type: CoinTransactionType.EARN,
                source: CoinTransactionSource.PREMIUM_UPGRADE,
                description: `Purchased ${purchase.coins} coins for ₹${purchase.amount}`,
                metadata: {
                    purchaseId: purchase.id,
                    paymentId: dto.paymentId,
                    orderId: dto.orderId,
                    amount: purchase.amount
                }
            });
            await this.coinTransactionRepository.create(coinTransaction);

            return { 
                success: true, 
                message: `Successfully added ${purchase.coins} coins to your account`,
                coins: purchase.coins
            };

        } catch (error) {
            // Mark purchase as failed
            purchase.markAsFailed();
            await this.coinPurchaseRepository.update(purchase.id!, purchase);
            throw new AppError('Purchase completion failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}
