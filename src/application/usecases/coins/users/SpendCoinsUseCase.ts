

import mongoose from 'mongoose';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../../domain/entities/CoinTransaction';
import { ICoinTransactionRepository } from '../../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { inject, injectable } from 'tsyringe';


@injectable()
export class SpendCoinsUseCase {
    constructor(
        @inject("ICoinTransactionRepository") private coinTransactionRepository: ICoinTransactionRepository,
        @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository
    ) { }

    async execute(
        userId: string,
        amount: number,
        source: CoinTransactionSource,
        description: string,
        metadata?: Record<string, any>
    ): Promise<CoinTransaction> {
        if (amount <= 0) {
            throw new Error('Spend amount must be positive');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check if user has sufficient balance
            const userProfile = await this.userProfileRepository.findByUserId(userId);
            if (!userProfile) {
                throw new Error('User profile not found');
            }

            if (userProfile.coinBalance < amount) {
                throw new Error('Insufficient coin balance');
            }

            // Create transaction record
            const transaction = new CoinTransaction({
                userId,
                amount,
                type: CoinTransactionType.SPEND,
                source,
                description,
                metadata
            });

            const savedTransaction = await this.coinTransactionRepository.create(transaction);

            // Update user balance
            userProfile.coinBalance -= amount;
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
