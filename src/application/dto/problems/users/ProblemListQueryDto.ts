export interface ProblemListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: 'Easy' | 'Med.' | 'Hard' | 'all';
  sortBy?: 'none' | 'acceptance-asc' | 'acceptance-desc';
}

export interface ProblemListItemDto {
  id: number;
  number: number;
  title: string;
  slug: string;
  acceptance: number;
  difficulty: 'Easy' | 'Med.' | 'Hard';
  status: 'solved' | null;
}

export interface ProblemListPaginationDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasMore: boolean;
}

export interface ProblemListApiResponseDto {
  data: ProblemListItemDto[];
  pagination: ProblemListPaginationDto;
}

