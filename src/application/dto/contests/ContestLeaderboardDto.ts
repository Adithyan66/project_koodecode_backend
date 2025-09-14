

export interface ContestLeaderboardDto {
  contestId: string;
  rankings: LeaderboardEntryDto[];
  totalParticipants: number;
  lastUpdated: Date;
  userRank?: number;
}

export interface LeaderboardEntryDto {
  rank: number;
  username: string;
  profileImage?: string;
  totalScore: number;
  timeTaken: string;
  attempts: number;
  status: string;
  coinsEarned?: number;
}
