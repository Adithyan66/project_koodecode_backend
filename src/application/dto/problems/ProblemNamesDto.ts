

export interface ProblemNameDto {
  problemNumber: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ProblemNamesRequestDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ProblemNamesResponseDto {
  problems: ProblemNameDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
    limit: number;
  };
}
