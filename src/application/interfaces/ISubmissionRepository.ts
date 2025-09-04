// import { Submission, TestResult } from '../../domain/entities/Submission';

// export interface ISubmissionRepository {
//     create(submission: Submission): Promise<Submission>;
//     findById(id: string): Promise<Submission | null>;
//     findByUserId(userId: string, limit?: number): Promise<Submission[]>;
//     findByProblemAndUser(problemId: string, userId: string): Promise<Submission[]>;
//     updateStatus(id: string, status: string, testResults: TestResult[]): Promise<void>;
//     updateExecutionMetrics(id: string, executionTime: number, memoryUsage: number): Promise<void>;
// }


import { Submission } from '../../domain/entities/Submission';

export interface ISubmissionRepository {
  create(submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
  findByUserId(userId: string): Promise<Submission[]>;
  findByProblemId(problemId: string): Promise<Submission[]>;
  findByUserAndProblem(userId: string, problemId: string): Promise<Submission[]>;
  update(id: string, updates: Partial<Submission>): Promise<Submission>;
  updateByJudge0Token(token: string, updates: Partial<Submission>): Promise<Submission>;
  delete(id: string): Promise<void>;
  findByStatus(status: string): Promise<Submission[]>;
}
