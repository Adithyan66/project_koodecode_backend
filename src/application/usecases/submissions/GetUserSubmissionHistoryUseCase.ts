import { inject, injectable } from 'tsyringe';
import { ISubmissionRepository } from '../../../domain/interfaces/repositories/ISubmissionRepository';
import { ISubmissionDistributionService } from '../../interfaces/ISubmissionDistributionService';
import { SubmissionHistoryResponseDto } from '../../dto/submissions/SubmissionHistoryResponseDto';
import { SubmissionResponseDto, TestCaseResultDto } from '../../dto/submissions/SubmissionResponseDto';
import { ProgrammingLanguage } from '../../../domain/value-objects/ProgrammingLanguage';
import { Submission, TestCaseResult } from '../../../domain/entities/Submission';

@injectable()
export class GetUserSubmissionHistoryUseCase {
  constructor(
    @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository,
    @inject('ISubmissionDistributionService') private distributionService: ISubmissionDistributionService
  ) {}

  async execute(
    userId: string,
    problemId: string,
    page: number,
    limit: number
  ): Promise<SubmissionHistoryResponseDto> {
    const [submissions, total] = await Promise.all([
      this.submissionRepository.findByUserAndProblemPaginated(userId, problemId, page, limit),
      this.submissionRepository.countByUserAndProblem(userId, problemId)
    ]);

    const submissionDtos = await Promise.all(
      submissions.map(submission => this.mapToSubmissionDto(submission))
    );

    const totalPages = Math.ceil(total / limit);

    return {
      submissions: submissionDtos,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  private async mapToSubmissionDto(submission: Submission): Promise<SubmissionResponseDto> {
    const languageInfo = ProgrammingLanguage.getLanguageInfo(submission.languageId);
    
    const response: SubmissionResponseDto = {
      id: submission.id,
      userId: submission.userId,
      problemId: typeof submission.problemId === 'string' ? submission.problemId : submission.problemId.toString(),
      status: this.mapStatus(submission.status),
      overallVerdict: submission.overallVerdict,
      testCasesPassed: submission.testCasesPassed,
      totalTestCases: submission.totalTestCases,
      score: submission.score,
      totalExecutionTime: submission.totalExecutionTime,
      maxMemoryUsage: submission.maxMemoryUsage,
      submittedAt: submission.createdAt,
      code: submission.sourceCode,
      language: {
        id: submission.languageId,
        name: languageInfo?.name || 'Unknown'
      }
    };

    if (submission.overallVerdict === 'Accepted') {
      try {
        const [runtimeDistribution, memoryDistribution] = await Promise.all([
          this.distributionService.calculateRuntimeDistribution(
            typeof submission.problemId === 'string' ? submission.problemId : submission.problemId.toString(),
            submission.totalExecutionTime
          ),
          this.distributionService.calculateMemoryDistribution(
            typeof submission.problemId === 'string' ? submission.problemId : submission.problemId.toString(),
            submission.maxMemoryUsage
          )
        ]);

        if (runtimeDistribution) {
          response.runtimeDistribution = runtimeDistribution;
        }

        if (memoryDistribution) {
          response.memoryDistribution = memoryDistribution;
        }
      } catch (error) {
        console.error('Error calculating distributions:', error);
      }
    } else {
      if (submission.testCaseResults && submission.testCaseResults.length > 0) {
        const firstFailedTestCase = submission.testCaseResults.find(
          tc => tc.status !== 'passed'
        );
        
        if (firstFailedTestCase) {
          response.testCaseResults = [this.mapTestCaseResult(firstFailedTestCase)];
        }
      }
    }

    return response;
  }

  private mapTestCaseResult(testCase: TestCaseResult): TestCaseResultDto {
    return {
      testCaseId: testCase.testCaseId,
      status: testCase.status,
      executionTime: testCase.executionTime,
      memoryUsage: testCase.memoryUsage,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: testCase.actualOutput
    };
  }

  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'processing': 'processing',
      'accepted': 'completed',
      'rejected': 'completed',
      'error': 'completed',
      'time_limit_exceeded': 'completed',
      'memory_limit_exceeded': 'completed',
      'compilation_error': 'completed'
    };
    return statusMap[status] || status;
  }
}


