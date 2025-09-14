



export interface CreateContestDto {
  title: string;
  description: string;
  problemIds: string[];
  startTime: Date;
  endTime: Date;
  thumbnail:string;
  registrationDeadline: Date;
  problemTimeLimit: number;
  maxAttempts: number;
  wrongSubmissionPenalty: number;
  coinRewards: ContestRewardDto[];
}

export interface ContestRewardDto {
  rank: number;
  coins: number;
}
