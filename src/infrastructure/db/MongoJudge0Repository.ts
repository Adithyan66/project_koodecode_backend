

import { IJudge0Repository } from '../..***REMOVED***y';
import { Judge0Submission } from '../../domain/entities/Judge0Submission';
import { Judge0SubmissionModel } from './models/Judge0SubmissionModel';

export class MongoJudge0Repository implements IJudge0Repository {
  async create(submission: Omit<Judge0Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Judge0Submission> {
    const judge0Submission = new Judge0SubmissionModel(submission);
    const saved = await judge0Submission.save();
    return this.mapToEntity(saved);
  }

  async findByToken(token: string): Promise<Judge0Submission | null> {
    const submission = await Judge0SubmissionModel.findOne({ token });
    return submission ? this.mapToEntity(submission) : null;
  }

  async findBySubmissionId(submissionId: string): Promise<Judge0Submission[]> {
    const submissions = await Judge0SubmissionModel.find({ submissionId });
    return submissions.map(this.mapToEntity);
  }

  async updateByToken(token: string, updates: Partial<Judge0Submission>): Promise<Judge0Submission> {
    const updated = await Judge0SubmissionModel.findOneAndUpdate(
      { token },
      updates,
      { new: true }
    );
    
    if (!updated) {
      throw new Error('Judge0 submission not found');
    }
    
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await Judge0SubmissionModel.findByIdAndDelete(id);
  }

  private mapToEntity(doc: any): Judge0Submission {
    return {
      id: doc._id.toString(),
      token: doc.token,
      sourceCode: doc.sourceCode,
      languageId: doc.languageId,
      stdin: doc.stdin,
      expectedOutput: doc.expectedOutput,
      status: doc.status,
      stdout: doc.stdout,
      stderr: doc.stderr,
      compileOutput: doc.compileOutput,
      executionTime: doc.executionTime,
      memoryUsage: doc.memoryUsage,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
