import { SubmissionResponseDto } from './SubmissionResponseDto';

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SubmissionHistoryResponseDto {
  submissions: SubmissionResponseDto[];
  pagination: PaginationMetadata;
}


