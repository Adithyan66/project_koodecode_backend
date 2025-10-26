export interface UserContestDataDto {
  contestsParticipated: number;
  contestsWon: number;
  averageRanking: number;
  totalContestRating: number;
  contests: Array<{
    contestId: string;
    contestName: string;
    contestThumbnail?: string;
    totalParticipants: number;
    rank: number;
    ratingChange: number;
    participatedAt: string;
    contestDate: string;
    coinsEarned: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
