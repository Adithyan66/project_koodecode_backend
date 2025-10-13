

// import { IPaymentGatewayService } from '../../../domain/interfaces/services/IPaymentGatewayService';
// import { ICoinPurchaseRepository } from '../../../domain/interfaces/repositories/ICoinPurchaseRepository';
// import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';
// import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
// import { CompletePurchaseDto } from '../../dto/coins/CoinPurchaseDto';
// import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';
// import { AppError } from '../../../shared/exceptions/AppError';
// import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
// import { inject, injectable } from 'tsyringe';
// import { ICompleteCoinPurchaseUseCase } from '../../interfaces/ICoinUseCase';


// @injectable()
// export class CompleteCoinPurchaseUseCase implements ICompleteCoinPurchaseUseCase{

//     constructor(
//         @inject("IPaymentGatewayService") private paymentGatewayService: IPaymentGatewayService,
//         @inject("ICoinPurchaseRepository") private coinPurchaseRepository: ICoinPurchaseRepository,
//         @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository,
//         @inject("ICoinTransactionRepository") private coinTransactionRepository: ICoinTransactionRepository
//     ) { }

//     async execute(dto: CompletePurchaseDto): Promise<{ message: string; coins: number }> {

//         const isValidSignature = await this.paymentGatewayService.verifyPaymentSignature(
//             dto.orderId,
//             dto.paymentId,
//             dto.signature
//         );

//         if (!isValidSignature) {
//             throw new AppError('Invalid payment signature', HTTP_STATUS.BAD_REQUEST);
//         }

//         const purchase = await this.coinPurchaseRepository.findByExternalOrderId(dto.orderId);
//         if (!purchase) {
//             throw new AppError('Purchase record not found', HTTP_STATUS.NOT_FOUND);
//         }

//         if (purchase.isCompleted()) {
//             return {
//                 message: 'Purchase already completed',
//                 coins: purchase.coins
//             };
//         }

//         try {

//             purchase.externalPaymentId = dto.paymentId;
//             purchase.markAsCompleted();
//             await this.coinPurchaseRepository.update(purchase.id!, purchase);

//             const userProfile = await this.userProfileRepository.findByUserId(purchase.userId);
//             if (!userProfile) {
//                 throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
//             }

//             userProfile.coinBalance += purchase.coins;
//             await this.userProfileRepository.update(purchase.userId, {
//                 coinBalance: userProfile.coinBalance
//             });

//             const coinTransaction = new CoinTransaction({
//                 userId: purchase.userId,
//                 amount: purchase.coins,
//                 type: CoinTransactionType.EARN,
//                 source: CoinTransactionSource.PREMIUM_UPGRADE,
//                 description: `Purchased ${purchase.coins} coins for ₹${purchase.amount}`,
//                 metadata: {
//                     purchaseId: purchase.id,
//                     paymentId: dto.paymentId,
//                     orderId: dto.orderId,
//                     amount: purchase.amount
//                 }
//             });
//             await this.coinTransactionRepository.create(coinTransaction);

//             return {
//                 message: `Successfully added ${purchase.coins} coins to your account`,
//                 coins: purchase.coins
//             };

//         } catch (error) {
//             purchase.markAsFailed();
//             await this.coinPurchaseRepository.update(purchase.id!, purchase);
//             throw new AppError('Purchase completion failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
//         }
//     }
// }






























import { IPaymentGatewayService } from '../../../domain/interfaces/services/IPaymentGatewayService';
import { ICoinPurchaseRepository } from '../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { CompletePurchaseDto } from '../../dto/coins/CoinPurchaseDto';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';
import { inject, injectable } from 'tsyringe';
import { ICompleteCoinPurchaseUseCase } from '../../interfaces/ICoinUseCase';
import { 
  InvalidPaymentSignatureError,
  PaymentOrderNotFoundError,
  PaymentAlreadyCompletedError,
  CoinPurchaseCompletionError,
  UserProfileNotFoundError,
  CoinBalanceUpdateError,
  TransactionRecordingError,
  PurchaseRecordUpdateError
} from '../../../domain/errors/CoinErrors';

import { MissingFieldsError } from '../../../domain/errors/AuthErrors';

@injectable()
export class CompleteCoinPurchaseUseCase implements ICompleteCoinPurchaseUseCase {

    constructor(
        @inject("IPaymentGatewayService") private paymentGatewayService: IPaymentGatewayService,
        @inject("ICoinPurchaseRepository") private coinPurchaseRepository: ICoinPurchaseRepository,
        @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository,
        @inject("ICoinTransactionRepository") private coinTransactionRepository: ICoinTransactionRepository
    ) { }

    async execute(dto: CompletePurchaseDto): Promise<{ message: string; coins: number }> {

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
            await this.completePurchaseTransaction(dto, purchase);

            return {
                message: `Successfully added ${purchase.coins} coins to your account`,
                coins: purchase.coins
            };

        } catch (error) {
            await this.markPurchaseAsFailed(purchase);
            
            if (error instanceof InvalidPaymentSignatureError ||
                error instanceof PaymentOrderNotFoundError ||
                error instanceof PaymentAlreadyCompletedError ||
                error instanceof UserProfileNotFoundError ||
                error instanceof CoinBalanceUpdateError ||
                error instanceof TransactionRecordingError ||
                error instanceof PurchaseRecordUpdateError) {
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

    private async completePurchaseTransaction(dto: CompletePurchaseDto, purchase: any): Promise<void> {
        try {
            purchase.externalPaymentId = dto.paymentId;
            purchase.markAsCompleted();
            await this.coinPurchaseRepository.update(purchase.id!, purchase);
        } catch (error) {
            throw new PurchaseRecordUpdateError(purchase.id!);
        }

        await this.updateUserCoinBalance(purchase);

        await this.recordCoinTransaction(dto, purchase);
    }

    private async updateUserCoinBalance(purchase: any): Promise<void> {
        const userProfile = await this.userProfileRepository.findByUserId(purchase.userId);
        if (!userProfile) {
            throw new UserProfileNotFoundError(purchase.userId);
        }

        try {
            userProfile.coinBalance += purchase.coins;
            await this.userProfileRepository.update(purchase.userId, {
                coinBalance: userProfile.coinBalance
            });
        } catch (error) {
            throw new CoinBalanceUpdateError(purchase.userId);
        }
    }

    private async recordCoinTransaction(dto: CompletePurchaseDto, purchase: any): Promise<void> {
        try {
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
        } catch (error) {
            throw new TransactionRecordingError(purchase.userId, purchase.coins);
        }
    }

    private async markPurchaseAsFailed(purchase: any): Promise<void> {
        try {
            purchase.markAsFailed();
            await this.coinPurchaseRepository.update(purchase.id!, purchase);
        } catch (error) {
            console.error(`Failed to mark purchase ${purchase.id} as failed:`, error);
        }
    }
}
