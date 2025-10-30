

import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { IContestParticipantRepository } from '../../../../domain/interfaces/repositories/IContestParticipantRepository';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { ContestParticipant, ParticipantStatus } from '../../../../domain/entities/ContestParticipant';
import { ContestRegistrationResponseDto } from '../../../dto/contests/ContestRegistrationDto';
import { inject, injectable } from 'tsyringe';
import { IRegisterForContestUseCase } from '../../../interfaces/IContestUseCase';


@injectable()
export class RegisterForContestUseCase implements IRegisterForContestUseCase{
  
  constructor(
    @inject('IContestRepository') private contestRepository: IContestRepository,
    @inject('IContestParticipantRepository') private participantRepository: IContestParticipantRepository,
    @inject('IProblemRepository') private problemRepository: IProblemRepository
  ) { }

  async execute(contestId: string, userId: string): Promise<ContestRegistrationResponseDto> {

    const contest = await this.contestRepository.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    if (!contest.isRegistrationOpen()) {
      throw new Error('Registration is not open for this contest');
    }


    const existingParticipant = await this.participantRepository.findByContestAndUser(contestId, userId);
    if (existingParticipant) {
      throw new Error('Already registered for this contest');
    }


    const randomProblemId = this.getRandomProblem(contest.problems);
    const assignedProblem = await this.problemRepository.findById(randomProblemId);

    if (!assignedProblem) {
      throw new Error('Error assigning problem for contest');
    }

    const participant = new ContestParticipant({
      id: '',
      contestId,
      userId,
      assignedProblemId: randomProblemId,
      registrationTime: new Date(),
      status: ParticipantStatus.REGISTERED,
      canContinue: true
    });

    const createdParticipant = await this.participantRepository.create(participant);
    await this.contestRepository.addParticipant(contestId, userId);

    return {
      participantId: createdParticipant.id!,
      contestId,
      assignedProblemTitle: assignedProblem.title,
      registrationTime: createdParticipant.registrationTime,
      message: 'Successfully registered for contest'
    };
  }

  private getRandomProblem(problems: string[]): string {
    const randomIndex = Math.floor(Math.random() * problems.length);
    return problems[randomIndex];
  }
}
