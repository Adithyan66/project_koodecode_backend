import { Contest } from "../../domain/entities/Contest";
import { ContestParticipant, ContestSubmission } from "../../domain/entities/ContestParticipant";


export interface IContestScoringService {
  calculateScore(participant: ContestParticipant, contest: Contest, newSubmission: ContestSubmission): number;
  calculateCoinRewards(participants: ContestParticipant[], contest: Contest): Map<string, number>;
}
