// src/application/usecases/coins/AwardCoinsUseCase.ts
import mongoose from 'mongoose';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';

export class AwardCoinsUseCase {
    constructor(
        private coinTransactionRepository: ICoinTransactionRepository,
        private userProfileRepository: IUserProfileRepository
    ) {}

    async execute(
        userId: string,
        amount: number,
        source: CoinTransactionSource,
        description: string,
        metadata?: Record<string, any>
    ): Promise<CoinTransaction> {
        if (amount <= 0) {
            throw new Error('Award amount must be positive');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create transaction record
            const transaction = new CoinTransaction({
                userId,
                amount,
                type: CoinTransactionType.EARN,
                source,
                description,
                metadata
            });

            const savedTransaction = await this.coinTransactionRepository.create(transaction);

            // Update user balance
            const userProfile = await this.userProfileRepository.findByUserId(userId);
            if (!userProfile) {
                throw new Error('User profile not found');
            }

            userProfile.coinBalance += amount;
            await this.userProfileRepository.update(userProfile);

            await session.commitTransaction();
            return savedTransaction;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
