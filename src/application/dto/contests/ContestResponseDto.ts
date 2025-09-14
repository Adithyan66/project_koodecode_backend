

export interface ContestResponseDto {
  id: string;
  contestNumber: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  registrationDeadline: Date;
  problemTimeLimit: number;
  thumbnail: string;
  maxAttempts: number;
  totalParticipants: number;
  coinRewards: ContestRewardDto[];
  state: string;
  canRegister: boolean;
  isRegistered: boolean;
  assignedProblem?: AssignedProblemDto;
  timeRemaining?: number;
  createdAt: Date;
}

export interface AssignedProblemDto {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  constraints: string;
  examples: any[];
}

export interface ContestRewardDto {
  rank: number;
  coins: number;
}
