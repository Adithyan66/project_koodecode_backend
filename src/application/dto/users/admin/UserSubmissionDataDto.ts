export interface UserSubmissionDataDto {
  totalSubmissions: number;
  acceptedSubmissions: number;
  rejectedSubmissions: number;
  submissionsByLanguage: Array<{
    language: string;
    count: number;
    percentage: number;
  }>;
  submissions: Array<{
    submissionId: string;
    problemTitle: string;
    language: string;
    status: string;
    submittedAt: string;
    score: number;
    totalExecutionTime: number;
    maxMemoryUsage: number;
    sourceCode: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

