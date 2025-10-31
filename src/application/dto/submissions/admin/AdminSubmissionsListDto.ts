
export interface AdminSubmissionListItemDto {
  id: string;
  user: {
    id: string;
    username?: string;
    email?: string;
  };
  problem: {
    id: string;
    title?: string;
    slug?: string;
  };
  sourceCode: string;
  language: {
    id: number;
    name: string;
  };
  status: string;
  score: number;
  totalExecutionTime: number;
  maxMemoryUsage: number;
  submissionType: 'problem' | 'contest';
  testCasesPassed: number;
  totalTestCases: number;
  createdAt: Date;
}

export interface AdminSubmissionsListRequestDto {
  page?: number;
  limit?: number;
  status?: string;
  problemId?: string;
  userId?: string;
  submissionType?: 'problem' | 'contest';
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'score' | 'totalExecutionTime' | 'maxMemoryUsage';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AdminSubmissionsListResponseDto {
  submissions: AdminSubmissionListItemDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    totalSubmissions: number;
    acceptedCount: number;
    rejectedCount: number;
    pendingCount: number;
    problemSubmissionsCount: number;
    contestSubmissionsCount: number;
  };
  filters: {
    status?: string;
    problemId?: string;
    userId?: string;
    submissionType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
}

