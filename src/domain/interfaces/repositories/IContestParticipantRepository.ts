

import { ContestParticipant, ContestSubmission } from '../../entities/ContestParticipant';

export interface IContestParticipantRepository {
  create(participant: ContestParticipant): Promise<ContestParticipant>;
  findById(id: string): Promise<ContestParticipant | null>;
  findByContestAndUser(contestId: string, userId: string): Promise<ContestParticipant | null>;
  findByContest(contestId: string): Promise<ContestParticipant[]>;
  findByUser(userId: string, page?: number, limit?: number): Promise<ContestParticipant[]>;
  update(id: string, updates: Partial<ContestParticipant>): Promise<ContestParticipant | null>;
  delete(id: string): Promise<boolean>;
  addSubmission(participantId: string, submission: ContestSubmission): Promise<boolean>;
  updateScore(participantId: string, score: number): Promise<boolean>;
  updateRank(participantId: string, rank: number): Promise<boolean>;
  getLeaderboard(contestId: string): Promise<ContestParticipant[]>;
  updateRankings(contestId: string): Promise<void>;
  getParticipantRank(participantId: string): Promise<number | null>;
  awardCoins(participantId: string, coins: number): Promise<boolean>;
  findByContestId(contestId: string): Promise<ContestParticipant[]>;
  findById(id: string): Promise<ContestParticipant | null>;
  getContestStats(contestId: string): Promise<{
    totalParticipants: number;
    completedParticipants: number;
    inProgressParticipants: number;
    averageScore: number;
  }>;
  getTopPerformers(contestId: string, limit: number): Promise<any[]>;
  softDeleteByContest(contestId: string): Promise<boolean>;
}
