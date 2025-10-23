

import { inject, injectable } from 'tsyringe';
import { Contest, ContestState } from '../../../../domain/entities/Contest';
import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { ContestResponseDto } from '../../../dto/contests/ContestResponseDto';
import { IGetContestsListUseCase } from '../../../interfaces/IContestUseCase';

export type ContestListType = 'active' | 'upcoming' | 'past';

export interface ContestListResponseDto extends ContestResponseDto {
    maxReward: number
}


@injectable()
export class GetContestsListUseCase implements IGetContestsListUseCase{

    constructor(
        @inject('IContestRepository') private contestRepository: IContestRepository
    ) { }

    async execute(
        type: ContestListType,
        userId: string
    ): Promise<ContestListResponseDto[]> {
        let contests: Contest[];


        switch (type) {
            case 'active':
                contests = await this.contestRepository.findActive();
                break;
            case 'upcoming':
                contests = await this.contestRepository.findUpcoming();
                break;
            case 'past':
                contests = await this.contestRepository.findByState(type);
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

            const contestDto: ContestListResponseDto = {
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
            };

            if (type === 'active' && contest.isActive()) {
                contestDto.timeRemaining = this.calculateTimeRemaining(contest.endTime);
            }

            contestListDtos.push(contestDto);
        }

        return contestListDtos;
    }

    private getMaxReward(coinRewards: any[]): number {
        if (!coinRewards || coinRewards.length === 0) return 0;
        return Math.max(...coinRewards.map(reward => reward.coins));
    }

    private calculateTimeRemaining(endTime: Date): number {
        const now = new Date();
        const timeDiff = endTime.getTime() - now.getTime();
        return Math.max(0, Math.floor(timeDiff / 1000)); // Return seconds, minimum 0
    }
}
