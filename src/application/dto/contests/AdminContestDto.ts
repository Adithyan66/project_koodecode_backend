export interface AdminContestDetailDto {
  id: string;
  contestNumber: number;
  title: string;
  description: string;
  createdBy: string;
  startTime: string;
  endTime: string;
  thumbnail?: string;
  registrationDeadline: string;
  problemTimeLimit: number;
  maxAttempts: number;
  wrongSubmissionPenalty: number;
  coinRewards: CoinRewardDto[];
  state: string;
  createdAt: string;
  updatedAt: string;
  
  // Contest Statistics
  stats: ContestStatsDto;
  
  // Problem Details
  problems: ContestProblemDto[];
  
  // Participant Data (varies by contest type)
  participants?: ParticipantDetailDto[];
  topPerformers?: TopPerformerDto[];
  
  // Contest Status
  status: ContestStatusDto;
}

export interface CoinRewardDto {
  rank: number;
  coins: number;
}

export interface ContestStatsDto {
  totalParticipants: number;
  completedParticipants: number;
  inProgressParticipants: number;
  averageScore: number;
  totalProblems: number;
  maxPossibleScore: number;
  isActive: boolean;
  timeRemaining?: number;
}

export interface ContestProblemDto {
  id: string;
  problemNumber: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  isActive: boolean;
}

export interface ParticipantDetailDto {
  id: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  profileImage?: string;
  assignedProblemId: string;
  registrationTime: string;
  startTime?: string;
  endTime?: string;
  totalScore: number;
  rank?: number;
  coinsEarned: number;
  status: string;
  attempts: number;
  timeTaken: number;
  submissions: ContestSubmissionDetailDto[];
}

export interface TopPerformerDto {
  rank: number;
  username: string;
  profileImage?: string;
  totalScore: number;
  timeTaken: string;
  attempts: number;
  status: string;
  coinsEarned?: number;
}

export interface ContestSubmissionDetailDto {
  id: string;
  submittedAt: string;
  isCorrect: boolean;
  timeTaken: number;
  attemptNumber: number;
  penaltyApplied: number;
  status: string;
  executionTime?: number;
  memoryUsed?: number;
  score?: number;
}

export interface ContestStatusDto {
  currentState: string;
  timeUntilStart?: number;
  timeUntilEnd?: number;
  timeUntilRegistrationDeadline?: number;
  isRegistrationOpen: boolean;
  isActive: boolean;
  isEnded: boolean;
  canRegister: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
}

export interface AdminContestListResponseDto {
  contests: AdminContestDetailDto[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AdminContestListRequestDto {
  page?: number;
  limit?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'createdAt' | 'startTime' | 'endTime' | 'participantCount';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateContestDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
  problemTimeLimit?: number;
  maxAttempts?: number;
  wrongSubmissionPenalty?: number;
  coinRewards?: CoinRewardDto[];
  thumbnail?: string;
  problems?: string[];
}

