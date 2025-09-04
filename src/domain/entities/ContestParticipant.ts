

export interface ContestParticipant {
  _id?: string;
  contestId: string;
  userId: string;
  registrationTime: Date;
  startTime?: Date;
  submissions: ContestSubmission[];
  totalScore: number;
  rank?: number;
  penalties: number; 
  isActive: boolean;
}

export interface ContestSubmission {
  problemId: string;
  submissionId: string;
  score: number;
  submissionTime: Date;
  attempts: number;
  penalty: number;
  isAccepted: boolean;
}
