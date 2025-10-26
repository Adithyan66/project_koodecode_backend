import { inject, injectable } from 'tsyringe';
import { IContestParticipantRepository } from '../../../../domain/interfaces/repositories/IContestParticipantRepository';
import { IContestRepository } from '../../../../domain/interfaces/repositories/IContestRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { IGetUserContestDataUseCase } from '../../../interfaces/IUserUseCase';
import { UserContestDataDto } from '../../../dto/users/admin/UserContestDataDto';
import { NotFoundError } from '../../../errors/AppErrors';

@injectable()
export class GetUserContestDataUseCase implements IGetUserContestDataUseCase {
  constructor(
    @inject('IContestParticipantRepository') private participantRepository: IContestParticipantRepository,
    @inject('IContestRepository') private contestRepository: IContestRepository,
    @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository
  ) {}

  async execute(userId: string, page: number, limit: number): Promise<UserContestDataDto> {

    const userProfile = await this.userProfileRepository.findByUserId(userId);
    if (!userProfile) {
      throw new NotFoundError('User not found');
    }

    const totalContests = await this.participantRepository.countByUser(userId);

    
    
    const allParticipants = await this.participantRepository.findByUser(userId, 1, totalContests);
    
    const paginatedParticipants = await this.participantRepository.findByUser(userId, page, limit);
    
    
    const validParticipants = allParticipants.filter(participant => 
      participant.contestId && 
      participant.contestId.trim() !== '' && 
      !participant.contestId.startsWith('invalid-')
    );
    
    const contestsParticipated = validParticipants.length;
    
    const contestsWon = validParticipants.filter(participant => 
      participant.rank !== null && participant.rank >= 1 && participant.rank <= 3
    ).length;
    
    const participantsWithRanks = validParticipants.filter(participant => participant.rank !== null);
    const averageRanking = participantsWithRanks.length > 0 
    ? participantsWithRanks.reduce((sum, participant) => sum + (participant.rank || 0), 0) / participantsWithRanks.length
    : 0;
    
    const contests = await Promise.all(
      paginatedParticipants
        .filter(participant => 
          participant.contestId && 
          participant.contestId.trim() !== '' && 
          !participant.contestId.startsWith('invalid-')
        )
        .map(async (participant) => {
          const contest = await this.contestRepository.findById(participant.contestId);
          const totalParticipants = await this.contestRepository.getParticipantCount(participant.contestId);
          
          console.log("Contest found:", contest?.title || 'Not found');
          return {
            contestId: participant.contestId,
            contestName: contest?.title || 'Unknown Contest',
            contestThumbnail: contest?.thumbnail,
            totalParticipants: totalParticipants,
            rank: participant.rank || 0,
            ratingChange: 0,
            participatedAt: participant.registrationTime ? participant.registrationTime.toISOString() : new Date().toISOString(),
            contestDate: contest?.startTime ? contest.startTime.toISOString() : new Date().toISOString(),
            coinsEarned: participant.coinsEarned || 0
          };
        })
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(contestsParticipated / limit);

    return {
      contestsParticipated,
      contestsWon,
      averageRanking: Math.round(averageRanking * 100) / 100, // Round to 2 decimal places
      totalContestRating: userProfile.contestRating || 0,
      contests,
      pagination: {
        page,
        limit,
        total: contestsParticipated,
        totalPages
      }
    };
  }
}
