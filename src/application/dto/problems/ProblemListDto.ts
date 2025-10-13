
import { Problem } from "../../../domain/entities/Problem";

export interface ProblemDto {
  id: string;
  problemNumber: number;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  likes: number;
  acceptanceRate: number;
  totalSubmissions: number;
  isActive: boolean;
}

export interface ProblemListResponseDto {
  problems: ProblemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage:boolean;
  hasPreviousPage:boolean;
  startIndex:number;
  endIndex:number
}


export interface ProblemListDto {
  problems: Problem[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
  filters?: {
    search?: string;
    difficulty?: string;
    category?: string;
    tags?: string[];
  };
  availableFilters?: {
    difficulties: string[];
    categories: string[];
    tags: string[];
  };
}
