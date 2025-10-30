

// export interface ContestDetailDto {
//   id:string;
//   contestNumber: number;
//   title: string;
//   description: string;
//   startTime: string;
//   endTime: string;
//   thumbnail: string;
//   registrationDeadline: string;
//   problemTimeLimit: number;
//   maxAttempts: number;
//   wrongSubmissionPenalty: number;
//   coinRewards: CoinRewardDto[];
//   state: string;
//   isUserRegistered: boolean;
// }

export interface CoinRewardDto {
  rank: number;
  coins: number;
}




export interface SubmissionDto {
  id: string;
  problemId: string;
  userId: string;
  language: string;
  code: string;
  status: string;
  executionTime?: number;
  memoryUsed?: number;
  score?: number;
  submittedAt: string;
  testCasesPassed?: number;
  totalTestCases?: number;
}

export interface ContestDetailDto {
  id: string;
  contestNumber: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  thumbnail?: string;
  registrationDeadline: string;
  problemTimeLimit: number;
  maxAttempts: number;
  wrongSubmissionPenalty: number;
  coinRewards: CoinRewardDto[];
  state: string;
  isUserRegistered: boolean;
  isParticipantCompleted: boolean;
  canContinue: boolean;
  participantsCount: number;
  userSubmission?: SubmissionDto; 
}
