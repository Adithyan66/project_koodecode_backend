

import { Judge0Submission } from '../../domain/entities/Judge0Submission';

export interface IJudge0Repository {
  create(submission: Omit<Judge0Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Judge0Submission>;
  findByToken(token: string): Promise<Judge0Submission | null>;
  findBySubmissionId(submissionId: string): Promise<Judge0Submission[]>;
  updateByToken(token: string, updates: Partial<Judge0Submission>): Promise<Judge0Submission>;
  delete(id: string): Promise<void>;
}
