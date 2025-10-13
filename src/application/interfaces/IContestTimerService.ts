import { Contest, ContestState } from "../../domain/entities/Contest";
import { ContestParticipant } from "../../domain/entities/ContestParticipant";


export interface IContestTimerService {
  checkContestStatus(contest: Contest): ContestState;
  checkParticipantTimeLimit(participant: ContestParticipant, contest: Contest): boolean;
  getRemainingTime(participant: ContestParticipant, contest: Contest): number;
  getContestRemainingTime(contest: Contest): number;
  updateContestStatuses(): Promise<void>;
  distributeContestRewards(contestId: string): Promise<void>;
}
