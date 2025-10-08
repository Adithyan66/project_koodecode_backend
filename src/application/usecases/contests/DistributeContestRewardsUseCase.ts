

// src/application/usecases/coins/DistributeContestRewardsUseCase.ts
import mongoose from 'mongoose';
import { CoinTransaction, CoinTransactionType, CoinTransactionSource } from '../../../domain/entities/CoinTransaction';
import { Contest, ContestState } from '../../../domain/entities/Contest';
import { ParticipantStatus } from '../../../domain/entities/ContestParticipant';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';
import { IContestRepository } from '../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../domain/interfaces/repositories/IContestParticipantRepository';

export class DistributeContestRewardsUseCase {
    constructor(
        private coinTransactionRepository: ICoinTransactionRepository,
        private userProfileRepository: IUserProfileRepository,
        private contestRepository: IContestRepository,
        private contestParticipantRepository: IContestParticipantRepository
    ) { }

    async execute(contestId: string): Promise<{
        distributed: boolean;
        rewardsGiven: number;
        totalParticipants: number;
        reason?: string
    }> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get contest details
            const contest = await this.contestRepository.findById(contestId);
            if (!contest) {
                throw new Error('Contest not found');
            }

            // Check if contest has ended
            if (contest.state !== ContestState.ENDED) {
                return {
                    distributed: false,
                    rewardsGiven: 0,
                    totalParticipants: 0,
                    reason: 'Contest has not ended yet'
                };
            }

            // Check if rewards already distributed (prevent duplicate distribution)
            const existingRewards = await this.coinTransactionRepository.findByUserIdAndSource(
                contest.participants[0] || '', // Check any participant
                CoinTransactionSource.CONTEST_WIN,
                1
            );

            const alreadyDistributed = existingRewards.some(t =>
                t.metadata?.contestId === contestId
            );

            if (alreadyDistributed) {
                return {
                    distributed: false,
                    rewardsGiven: 0,
                    totalParticipants: contest.participants.length,
                    reason: 'Rewards already distributed for this contest'
                };
            }

            // Get leaderboard (sorted participants)
            const leaderboard = await this.contestParticipantRepository.getLeaderboard(contestId);

            // Filter only completed participants for rewards
            const eligibleParticipants = leaderboard.filter(p =>
                p.status === ParticipantStatus.COMPLETED
            );

            if (eligibleParticipants.length === 0) {
                // Update contest state to results published
                await this.contestRepository.update(contestId, {
                    state: ContestState.RESULTS_PUBLISHED
                });

                await session.commitTransaction();
                return {
                    distributed: true,
                    rewardsGiven: 0,
                    totalParticipants: leaderboard.length,
                    reason: 'No eligible participants for rewards'
                };
            }

            let rewardsGiven = 0;

            // Distribute coins based on rank and contest reward configuration
            for (let i = 0; i < eligibleParticipants.length; i++) {
                const participant = eligibleParticipants[i];
                const rank = i + 1; // 1-based ranking

                // Find reward for this rank
                const rewardConfig = contest.coinRewards.find(r => r.rank === rank);

                if (rewardConfig && rewardConfig.coins > 0) {
                    // Award coins to participant
                    const transaction = new CoinTransaction({
                        userId: participant.userId,
                        amount: rewardConfig.coins,
                        type: CoinTransactionType.EARN,
                        source: CoinTransactionSource.CONTEST_WIN,
                        description: `Contest reward for rank ${rank} in "${contest.title}"`,
                        metadata: {
                            contestId: contest.id,
                            contestNumber: contest.contestNumber,
                            contestTitle: contest.title,
                            rank: rank,
                            totalParticipants: eligibleParticipants.length,
                            totalScore: participant.totalScore,
                            timeTaken: participant.getTimeTaken()
                        }
                    });

                    // Save transaction
                    await this.coinTransactionRepository.create(transaction);

                    // Update user profile balance
                    const userProfile = await this.userProfileRepository.findByUserId(participant.userId);
                    if (userProfile) {
                        userProfile.coinBalance += rewardConfig.coins;
                        await this.userProfileRepository.update(participant.userId, userProfile);
                    }

                    // Update participant with coins earned
                    await this.contestParticipantRepository.awardCoins(participant.id!, rewardConfig.coins);

                    rewardsGiven++;

                    console.log(`[DistributeContestRewards] Awarded ${rewardConfig.coins} coins to user ${participant.userId} for rank ${rank} in contest ${contest.title}`);
                }
            }

            // Update contest state to results published
            await this.contestRepository.update(contestId, {
                state: ContestState.RESULTS_PUBLISHED
            });

            await session.commitTransaction();

            return {
                distributed: true,
                rewardsGiven,
                totalParticipants: leaderboard.length
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('[DistributeContestRewards] Error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }
}
