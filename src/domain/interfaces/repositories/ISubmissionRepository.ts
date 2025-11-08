
import { Submission } from '../../entities/Submission';

export interface AdminSubmissionFilters {
  status?: string;
  problemId?: string;
  userId?: string;
  submissionType?: 'problem' | 'contest';
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface AdminSubmissionSort {
  sortBy?: 'createdAt' | 'score' | 'totalExecutionTime' | 'maxMemoryUsage';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminSubmissionPagination {
  page: number;
  limit: number;
}

export interface AdminSubmissionsResult {
  submissions: any[];
  total: number;
}

export interface ISubmissionRepository {
  create(submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
  findByUserId(userId: string): Promise<Submission[]>;
  findByProblemId(problemId: string): Promise<Submission[]>;
  findByUserAndProblem(userId: string, problemId: string): Promise<Submission[]>;
  findByUserIdAndProblemId(userId: string, problemId: string): Promise<Submission[]>;
  update(id: string, updates: Partial<Submission>): Promise<Submission>;
  updateByJudge0Token(token: string, updates: Partial<Submission>): Promise<Submission>;
  delete(id: string): Promise<void>;
  findByStatus(status: string): Promise<Submission[]>;
  findByUserIdPaginated(userId: string, page: number, limit: number, submissionType?: string): Promise<Submission[]>;
  countByUserId(userId: string, submissionType?: string): Promise<number>;
  findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date, submissionType?: string): Promise<Submission[]>;
  findAcceptedByProblemId(problemId: string): Promise<Submission[]>;
  findAllForAdmin(
    filters: AdminSubmissionFilters,
    pagination: AdminSubmissionPagination,
    sort: AdminSubmissionSort
  ): Promise<AdminSubmissionsResult>;
  findByUserAndProblemPaginated(userId: string, problemId: string, page: number, limit: number): Promise<Submission[]>;
  countByUserAndProblem(userId: string, problemId: string): Promise<number>;
}
