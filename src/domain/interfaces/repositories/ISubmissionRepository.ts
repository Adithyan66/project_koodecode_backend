
import { Submission } from '../../entities/Submission';

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
}
