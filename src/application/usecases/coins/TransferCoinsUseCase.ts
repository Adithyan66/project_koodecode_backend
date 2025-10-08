// src/application/usecases/coins/TransferCoinsUseCase.ts
import mongoose from 'mongoose';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';

export class TransferCoinsUseCase {
    constructor(
        private coinTransactionRepository: ICoinTransactionRepository,
        private userProfileRepository: IUserProfileRepository
    ) {}

    async execute(
        fromUserId: string,
        toUserId: string,
        amount: number,
        description: string
    ): Promise<{ fromTransaction: CoinTransaction; toTransaction: CoinTransaction }> {
        if (amount <= 0) {
            throw new Error('Transfer amount must be positive');
        }

        if (fromUserId === toUserId) {
            throw new Error('Cannot transfer coins to yourself');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get both user profiles
            const [fromProfile, toProfile] = await Promise.all([
                this.userProfileRepository.findByUserId(fromUserId),
                this.userProfileRepository.findByUserId(toUserId)
            ]);

            if (!fromProfile) {
                throw new Error('Sender profile not found');
            }

            if (!toProfile) {
                throw new Error('Receiver profile not found');
            }

            // Check sender balance
            if (fromProfile.coinBalance < amount) {
                throw new Error('Insufficient balance for transfer');
            }

            // Create debit transaction for sender
            const fromTransaction = new CoinTransaction({
                userId: fromUserId,
                amount,
                type: CoinTransactionType.SPEND,
                source: CoinTransactionSource.REFUND,
                description: `Transfer to user: ${description}`,
                metadata: { transferTo: toUserId }
            });

            // Create credit transaction for receiver
            const toTransaction = new CoinTransaction({
                userId: toUserId,
                amount,
                type: CoinTransactionType.EARN,
                source: CoinTransactionSource.ADMIN_REWARD,
                description: `Transfer from user: ${description}`,
                metadata: { transferFrom: fromUserId }
            });

            // Save transactions
            const [savedFromTransaction, savedToTransaction] = await Promise.all([
                this.coinTransactionRepository.create(fromTransaction),
                this.coinTransactionRepository.create(toTransaction)
            ]);

            // Update balances
            fromProfile.coinBalance -= amount;
            toProfile.coinBalance += amount;

            await Promise.all([
                this.userProfileRepository.update(fromProfile),
                this.userProfileRepository.update(toProfile)
            ]);

            await session.commitTransaction();
            return { 
                fromTransaction: savedFromTransaction, 
                toTransaction: savedToTransaction 
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
