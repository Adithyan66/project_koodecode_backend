

export interface ProblemNameDto {
  id: string
  problemNumber: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'array' | 'pattern' | 'dsa';
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
