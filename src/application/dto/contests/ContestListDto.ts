export interface ContestListDto {
  contests: ContestSummaryDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface ContestSummaryDto {
  id: string;
  contestNumber: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  thumbnail:string;
  registrationDeadline: Date;
  totalParticipants: number;
  maxReward: number;
  state: string;
  canRegister: boolean;
  isRegistered: boolean;
  createdAt: Date;
}
