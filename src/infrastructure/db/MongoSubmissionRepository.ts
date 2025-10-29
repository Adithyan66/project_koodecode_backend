

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

  async findByUserIdAndProblemId(userId: string, problemId: string): Promise<Submission[]> {
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

  async findByUserIdPaginated(userId: string, page: number, limit: number, submissionType?: string): Promise<Submission[]> {
    const skip = (page - 1) * limit;
    const query: any = { userId };
    
    if (submissionType) {
      query.submissionType = submissionType;
    }
    
    const submissions = await SubmissionModel.find(query)
      .populate('problemId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return submissions.map(this.mapToEntity);
  }

  async countByUserId(userId: string, submissionType?: string): Promise<number> {
    const query: any = { userId };
    
    if (submissionType) {
      query.submissionType = submissionType;
    }
    
    return await SubmissionModel.countDocuments(query);
  }

  async findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date, submissionType?: string): Promise<Submission[]> {
    const query: any = { 
      userId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    if (submissionType) {
      query.submissionType = submissionType;
    }
    
    const submissions = await SubmissionModel.find(query)
      .sort({ createdAt: -1 });
    
    return submissions.map(this.mapToEntity);
  }

  async findAcceptedByProblemId(problemId: string): Promise<Submission[]> {
    const submissions = await SubmissionModel.find({
      problemId,
      overallVerdict: 'Accepted',
      status: 'accepted'
    })
      .select('totalExecutionTime maxMemoryUsage')
      .lean();
    
    return submissions.map(this.mapToEntity);
  }

  private mapToEntity(doc: any): any {
    const problemId = typeof doc.problemId === 'object' && doc.problemId._id 
      ? doc.problemId._id.toString() 
      : doc.problemId;

    const result: any = {
      id: doc._id.toString(),
      userId: doc.userId,
      problemId,
      sourceCode: doc.sourceCode,
      languageId: doc.languageId,
      status: doc.status,
      totalExecutionTime: doc.totalExecutionTime,
      maxMemoryUsage: doc.maxMemoryUsage,
      score:doc.score,
      output: doc.output,
      expectedOutput: doc.expectedOutput,
      judge0Token: doc.judge0Token,
      judge0Status: doc.judge0Status,
      testCasesPassed: doc.testCasesPassed,
      totalTestCases: doc.totalTestCases,
      submissionType:doc.submissionType,
      verdict: doc.verdict,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };

    if (typeof doc.problemId === 'object' && doc.problemId.title) {
      result.problemId = {
        _id: doc.problemId._id.toString(),
        title: doc.problemId.title
      };
    }

    return result;
  }
}
