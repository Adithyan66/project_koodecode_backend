

import { ISubmissionRepository } from '../../domain/interfaces/repositories/ISubmissionRepository';
import { Submission } from '../../domain/entities/Submission';
import { SubmissionModel } from './models/SubmissionModel';

export class MongoSubmissionRepository implements ISubmissionRepository {
  async create(submission: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Submission> {
    const submissionDoc = new SubmissionModel(submission);
    const saved = await submissionDoc.save();
    return this.mapToEntity(saved);
  }

  async findById(id: string): Promise<Submission | null> {
    const submission = await SubmissionModel.findById(id);
    return submission ? this.mapToEntity(submission) : null;
  }

  async findByUserId(userId: string): Promise<Submission[]> {
    const submissions = await SubmissionModel.find({ userId }).sort({ createdAt: -1 });
    return submissions.map(this.mapToEntity);
  }

  async findByProblemId(problemId: string): Promise<Submission[]> {
    const submissions = await SubmissionModel.find({ problemId }).sort({ createdAt: -1 });
    return submissions.map(this.mapToEntity);
  }

  async findByUserAndProblem(userId: string, problemId: string): Promise<Submission[]> {
    const submissions = await SubmissionModel.find({ userId, problemId }).sort({ createdAt: -1 });
    return submissions.map(this.mapToEntity);
  }

  async update(id: string, updates: Partial<Submission>): Promise<Submission> {
    const updated = await SubmissionModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      throw new Error('Submission not found');
    }
    return this.mapToEntity(updated);
  }

  async updateByJudge0Token(token: string, updates: Partial<Submission>): Promise<Submission> {
    const updated = await SubmissionModel.findOneAndUpdate(
      { judge0Token: token },
      updates,
      { new: true }
    );
    if (!updated) {
      throw new Error('Submission not found');
    }
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await SubmissionModel.findByIdAndDelete(id);
  }

  async findByStatus(status: string): Promise<Submission[]> {
    const submissions = await SubmissionModel.find({ status });
    return submissions.map(this.mapToEntity);
  }

  private mapToEntity(doc: any): Submission {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      problemId: doc.problemId,
      sourceCode: doc.sourceCode,
      languageId: doc.languageId,
      status: doc.status,
      executionTime: doc.executionTime,
      memoryUsage: doc.memoryUsage,
      output: doc.output,
      expectedOutput: doc.expectedOutput,
      judge0Token: doc.judge0Token,
      judge0Status: doc.judge0Status,
      testCasesPassed: doc.testCasesPassed,
      totalTestCases: doc.totalTestCases,
      verdict: doc.verdict,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
