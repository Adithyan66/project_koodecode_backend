import { inject, injectable } from 'tsyringe';
import { ISubmissionRepository } from '../../../../domain/interfaces/repositories/ISubmissionRepository';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { IGetSubmissionDetailForAdminUseCase } from '../../../interfaces/ISubmissionUseCase';
import { AdminSubmissionDetailDto, TestCaseResultDto } from '../../../dto/submissions/admin/AdminSubmissionDetailDto';
import { NotFoundError } from '../../../errors/AppErrors';
import { ProgrammingLanguage } from '../../../../domain/value-objects/ProgrammingLanguage';

@injectable()
export class GetSubmissionDetailForAdminUseCase implements IGetSubmissionDetailForAdminUseCase {

  constructor(
    @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IProblemRepository') private problemRepository: IProblemRepository
  ) {}

  async execute(submissionId: string): Promise<AdminSubmissionDetailDto> {
    const submission = await this.submissionRepository.findById(submissionId);
    
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    const [user, problem] = await Promise.all([
      this.userRepository.findById(submission.userId),
      this.problemRepository.findById(submission.problemId)
    ]);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!problem) {
      throw new NotFoundError('Problem not found');
    }

    const languageInfo = ProgrammingLanguage.getLanguageInfo(submission.languageId);
    if (!languageInfo) {
      throw new NotFoundError(`Language with ID ${submission.languageId} not found`);
    }

    const testCaseResults: TestCaseResultDto[] = (submission.testCaseResults || []).map((tc: any) => ({
      testCaseId: tc.testCaseId,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: tc.actualOutput,
      status: tc.status,
      executionTime: tc.executionTime,
      memoryUsage: tc.memoryUsage,
      judge0Token: tc.judge0Token,
      errorMessage: tc.errorMessage
    }));

    const executionTimes = testCaseResults
      .filter(tc => tc.executionTime !== undefined)
      .map(tc => tc.executionTime!);
    
    const memoryUsages = testCaseResults
      .filter(tc => tc.memoryUsage !== undefined)
      .map(tc => tc.memoryUsage!);

    const averageExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0;

    const averageMemoryUsage = memoryUsages.length > 0
      ? memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length
      : 0;

    return {
      id: submission.id,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      },
      problem: {
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        problemNumber: problem.problemNumber
      },
      sourceCode: submission.sourceCode,
      language: {
        id: submission.languageId,
        name: languageInfo.name,
        extension: languageInfo.extension
      },
      status: submission.status,
      overallVerdict: submission.overallVerdict,
      score: submission.score || 0,
      testCaseResults,
      testCasesPassed: submission.testCasesPassed || 0,
      totalTestCases: submission.totalTestCases || 0,
      performanceMetrics: {
        totalExecutionTime: submission.totalExecutionTime || 0,
        maxMemoryUsage: submission.maxMemoryUsage || 0,
        averageExecutionTime: Math.round(averageExecutionTime * 100) / 100,
        averageMemoryUsage: Math.round(averageMemoryUsage * 100) / 100
      },
      submissionType: submission.submissionType,
      judge0Token: submission.judge0Token,
      judge0Status: submission.judge0Status,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt
    };
  }
}

