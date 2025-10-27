import { inject, injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { ICoinPurchaseRepository } from '../../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { ICoinTransactionRepository } from '../../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IReconcileCoinPurchaseUseCase } from '../../../interfaces/ICoinUseCase';
import { ReconcilePurchaseResponseDto } from '../../../dto/coins/admin/CoinPurchaseDto';
import { NotFoundError, BadRequestError } from '../../../errors/AppErrors';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../../domain/entities/CoinTransaction';

@injectable()
export class ReconcileCoinPurchaseUseCase implements IReconcileCoinPurchaseUseCase {
    constructor(
        @inject('ICoinPurchaseRepository') private coinPurchaseRepository: ICoinPurchaseRepository,
        @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository,
        @inject('ICoinTransactionRepository') private coinTransactionRepository: ICoinTransactionRepository
    ) {}

    async execute(purchaseId: string, notes?: string): Promise<ReconcilePurchaseResponseDto> {
        if (!purchaseId || purchaseId.trim().length === 0) {
            throw new BadRequestError('Purchase ID is required');
        }

        const purchase = await this.coinPurchaseRepository.findById(purchaseId);

        if (!purchase) {
            throw new NotFoundError('Purchase not found');
        }

        if (!purchase.canBeReconciled()) {
            throw new BadRequestError('This purchase cannot be reconciled. Only pending purchases older than 5 minutes can be reconciled.');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            purchase.reconcile(notes);

            await this.coinPurchaseRepository.update(purchase.id!, purchase);

            const userProfile = await this.userProfileRepository.findByUserId(purchase.userId);
            if (!userProfile) {
                throw new NotFoundError('User profile not found');
            }

            userProfile.coinBalance += purchase.coins;
            await this.userProfileRepository.update(purchase.userId, {
                coinBalance: userProfile.coinBalance
            });

            const coinTransaction = new CoinTransaction({
                userId: purchase.userId,
                amount: purchase.coins,
                type: CoinTransactionType.EARN,
                source: CoinTransactionSource.MANUAL_RECONCILIATION,
                description: `Manually reconciled purchase of ${purchase.coins} coins for ₹${purchase.amount}`,
                metadata: {
                    purchaseId: purchase.id,
                    amount: purchase.amount,
                    reconciliationNotes: notes,
                    source: 'admin_reconciliation'
                }
            });

            await this.coinTransactionRepository.create(coinTransaction);
            await session.commitTransaction();

            return new ReconcilePurchaseResponseDto({
                success: true,
                message: 'Purchase reconciled successfully'
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

