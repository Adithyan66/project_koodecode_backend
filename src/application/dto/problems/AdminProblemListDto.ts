

export interface AdminProblemListDto {
  id: string;
  problemNumber: number;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'array' | 'pattern' | 'dsa';
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  totalTestCases: number;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  supportedLanguagesCount: number;
  tags: string[];
  companies: string[];
  daysSinceCreation: number;
}

export interface AdminProblemsListRequestDto {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'active' | 'inactive';
  type?: 'array' | 'pattern' | 'dsa';
  sortBy?: 'problemNumber' | 'title' | 'difficulty' | 'createdAt' | 'acceptanceRate' | 'totalSubmissions';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminProblemsListResponseDto {
  problems: AdminProblemListDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    totalProblems: number;
    activeCount: number;
    inactiveCount: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    averageAcceptanceRate: number;
    totalSubmissionsAcrossAll: number;
  };
  filters: {
    search?: string;
    difficulty?: string;
    status?: string;
    type?: string;
  };
}
