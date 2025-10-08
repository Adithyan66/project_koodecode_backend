

export interface ContestSubmissionDto {
  contestNumber: number;
  sourceCode: string;
  languageId: number;
}

export interface ContestSubmissionResponseDto {
  submissionId: string;
  isCorrect: boolean;
  timeTaken: number;
  attemptNumber: number;
  penaltyApplied: number;
  totalScore: number;
  rank?: number;
  message: string;
  result:any
}
