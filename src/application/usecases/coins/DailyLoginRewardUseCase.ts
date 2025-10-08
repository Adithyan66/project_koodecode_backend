// src/application/usecases/coins/DailyLoginRewardUseCase.ts
import mongoose from 'mongoose';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';

export class DailyLoginRewardUseCase {
    constructor(
        private coinTransactionRepository: ICoinTransactionRepository,
        private userProfileRepository: IUserProfileRepository
    ) {}

    async execute(userId: string): Promise<{ rewarded: boolean; transaction?: CoinTransaction; reason?: string }> {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Check if user already got reward today
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const existingReward = await this.coinTransactionRepository.findByUserIdAndDateRange(
            userId, 
            startOfDay, 
            endOfDay
        );

        const todayLoginReward = existingReward.find(t => 
            t.source === CoinTransactionSource.DAILY_LOGIN && 
            t.type === CoinTransactionType.EARN
        );

        if (todayLoginReward) {
            return { 
                rewarded: false, 
                reason: 'Daily login reward already claimed today' 
            };
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get user profile for streak calculation
            const userProfile = await this.userProfileRepository.findByUserId(userId);
            if (!userProfile) {
                throw new Error('User profile not found');
            }

            // Calculate reward based on streak (base 10 coins + streak bonus)
            const baseReward = 10;
            const streakBonus = Math.min(userProfile.streak.currentCount * 2, 50); // Max 50 bonus
            const totalReward = baseReward + streakBonus;

            // Create transaction
            const transaction = new CoinTransaction({
                userId,
                amount: totalReward,
                type: CoinTransactionType.EARN,
                source: CoinTransactionSource.DAILY_LOGIN,
                description: `Daily login reward (${baseReward} base + ${streakBonus} streak bonus)`,
                metadata: {
                    loginDate: todayStr,
                    streakCount: userProfile.streak.currentCount,
                    baseReward,
                    streakBonus
                }
            });

            const savedTransaction = await this.coinTransactionRepository.create(transaction);

            // Update user balance
            userProfile.coinBalance += totalReward;
            await this.userProfileRepository.update(userProfile);

            await session.commitTransaction();
            return { 
                rewarded: true, 
                transaction: savedTransaction 
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
