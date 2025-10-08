


import { Contest, ContestState, ContestReward } from '../../../domain/entities/Contest';
import { IContestRepository } from '../../../domain/interfaces/repositories/IContestRepository';
import { ICounterRepository } from '../../../domain/interfaces/repositories/ICounterRepository';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { CreateContestDto } from '../../dto/contests/CreateContestDto';

export class CreateContestUseCase {
    constructor(
        private contestRepository: IContestRepository,
        private counterRepository: ICounterRepository,
        private problemRepository: IProblemRepository
    ) { }

    async execute(createContestDto: CreateContestDto, adminUserId: string): Promise<Contest> {

        console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",createContestDto.problemIds);
        await this.validateProblems(createContestDto.problemIds);

        this.validateDates(createContestDto);

        const contestNumber = await this.counterRepository.getNextSequenceValue('contest');

        const coinRewards = createContestDto.coinRewards.map(reward =>
            new ContestReward({ rank: reward.rank, coins: reward.coins })
        );
        
        const contest = new Contest({
            id: '',
            contestNumber,
            title: createContestDto.title,
            description: createContestDto.description,
            createdBy: adminUserId,
            problems: createContestDto.problemIds,
            startTime: createContestDto.startTime,
            endTime: createContestDto.endTime,
            thumbnail: createContestDto.thumbnail,
            registrationDeadline: createContestDto.registrationDeadline,
            problemTimeLimit: createContestDto.problemTimeLimit,
            maxAttempts: createContestDto.maxAttempts,
            wrongSubmissionPenalty: createContestDto.wrongSubmissionPenalty,
            coinRewards,
            state: this.getContestState(createContestDto.startTime, createContestDto.endTime, createContestDto.registrationDeadline)
        });

        return await this.contestRepository.create(contest);
    }

    private async validateProblems(problemIds: string[]): Promise<void> {
        if (problemIds.length === 0) {
            throw new Error('At least one problem must be selected');
        }

        for (const problemId of problemIds) {
            const problem = await this.problemRepository.findById(problemId);
            if (!problem) {
                throw new Error(`Problem with id ${problemId} not found`);
            }
        }
    }

    private validateDates(dto: CreateContestDto): void {
        const now = new Date();

        if (dto.registrationDeadline <= now) {
            throw new Error('Registration deadline must be in the future');
        }

        if (dto.startTime <= dto.registrationDeadline) {
            throw new Error('Contest start time must be after registration deadline');
        }

        if (dto.endTime <= dto.startTime) {
            throw new Error('Contest end time must be after start time');
        }

        if (dto.problemTimeLimit <= 0) {
            throw new Error('Problem time limit must be greater than 0');
        }

        if (dto.maxAttempts <= 0) {
            throw new Error('Max attempts must be greater than 0');
        }
    }



    getContestState(startTime: Date, endTime: Date, registrationDeadline: Date) {

        const now = new Date();

        const start = new Date(startTime);
        const end = new Date(endTime);
        const regDeadline = new Date(registrationDeadline);


        if (now < regDeadline) {
            return ContestState.REGISTRATION_OPEN;
        }

        if (now >= regDeadline && now < start) {
            return ContestState.UPCOMING;
        }

        if (now >= start && now <= end) {
            return ContestState.ACTIVE;
        }

        if (now > end) {
            return ContestState.ENDED;
        }

        return ContestState.UPCOMING; 
    }

}
