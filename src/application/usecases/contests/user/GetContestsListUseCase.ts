

import { inject, injectable } from 'tsyringe';
import { Contest, ContestState } from '../../../../domain/entities/Contest';
import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { ContestResponseDto } from '../../../dto/contests/ContestResponseDto';
import { IGetContestsListUseCase } from '../../../interfaces/IContestUseCase';

export type ContestListType = 'active' | 'upcoming' | 'past';

export interface ContestListResponseDto extends ContestResponseDto {
    maxReward: number
}

export interface PaginatedContestListResponse {
    contests: ContestListResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}


@injectable()
export class GetContestsListUseCase implements IGetContestsListUseCase{

    constructor(
        @inject('IContestRepository') private contestRepository: IContestRepository
    ) { }

    async execute(
        type: ContestListType,
        userId: string,
        page?: number,
        limit?: number,
        search?: string
    ): Promise<ContestListResponseDto[] | PaginatedContestListResponse> {
        if (type === 'past') {
            const defaultPage = page || 1;
            const defaultLimit = limit || 10;
            
            const { contests, total } = await this.contestRepository.findByStateWithPagination(
                'ended',
                defaultPage,
                defaultLimit,
                search
            );

            const contestListDtos: ContestListResponseDto[] = [];

            for (const contest of contests) {
                const totalParticipants = await this.contestRepository.getParticipantCount(contest.id);
                const maxReward = this.getMaxReward(contest.coinRewards);
                const isRegistered = contest.participants.includes(userId);
                const canRegister = contest.isRegistrationOpen() && !isRegistered;

                contestListDtos.push({
                    id: contest.id,
                    contestNumber: contest.contestNumber,
                    title: contest.title,
                    description: contest.description,
                    thumbnail: contest.thumbnail,
                    startTime: contest.startTime,
                    endTime: contest.endTime,
                    registrationDeadline: contest.registrationDeadline,
                    totalParticipants,
                    maxReward,
                    state: contest.state,
                    isRegistered,
                    canRegister,
                    problemTimeLimit: 0,
                    maxAttempts: contest.maxAttempts,
                    coinRewards: contest.coinRewards,
                    createdAt: contest.createdAt
                });
            }

            return {
                contests: contestListDtos,
                total,
                page: defaultPage,
                limit: defaultLimit,
                totalPages: Math.ceil(total / defaultLimit)
            };
        }

        let contests: Contest[];

        switch (type) {
            case 'active':
                contests = await this.contestRepository.findActive();
                break;
            case 'upcoming':
                contests = await this.contestRepository.findUpcoming();
                break;
            default:
                throw new Error('Invalid contest list type');
        }

        const contestListDtos: ContestListResponseDto[] = [];

        for (const contest of contests) {
            const totalParticipants = await this.contestRepository.getParticipantCount(contest.id);
            const maxReward = this.getMaxReward(contest.coinRewards);
            const isRegistered = contest.participants.includes(userId);
            const canRegister = contest.isRegistrationOpen() && !isRegistered;

            contestListDtos.push({
                id: contest.id,
                contestNumber: contest.contestNumber,
                title: contest.title,
                description: contest.description,
                thumbnail: contest.thumbnail,
                startTime: contest.startTime,
                endTime: contest.endTime,
                registrationDeadline: contest.registrationDeadline,
                totalParticipants,
                maxReward,
                state: contest.state,
                isRegistered,
                canRegister,
                problemTimeLimit: 0,
                maxAttempts: contest.maxAttempts,
                coinRewards: contest.coinRewards,
                createdAt: contest.createdAt
            });
        }

        return contestListDtos;
    }

    private getMaxReward(coinRewards: any[]): number {
        if (!coinRewards || coinRewards.length === 0) return 0;
        return Math.max(...coinRewards.map(reward => reward.coins));
    }
}
