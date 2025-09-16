

export interface ContestDetailDto {
  id:string;
  contestNumber: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  thumbnail: string;
  registrationDeadline: string;
  problemTimeLimit: number;
  maxAttempts: number;
  wrongSubmissionPenalty: number;
  coinRewards: CoinRewardDto[];
  state: string;
  isUserRegistered: boolean;
}

export interface CoinRewardDto {
  rank: number;
  coins: number;
}
