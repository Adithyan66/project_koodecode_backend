





import { IJudge0Service } from '../../../domain/interfaces/services/IJudge0Service';
import { ISubmissionRepository } from '../../../domain/interfaces/repositories/ISubmissionRepository';
import { SubmissionResponseDto } from '../../dto/submissions/SubmissionResponseDto';

export class GetSubmissionResultUseCase {
  constructor(
    private judge0Service: IJudge0Service,
    private submissionRepository: ISubmissionRepository
  ) {}

  async execute(submissionId: string): Promise<SubmissionResponseDto> {

    
    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.judge0Token && submission.status === 'processing') {

      try {

        const judge0Result = await this.judge0Service.getSubmissionResult(submission.judge0Token);
        
        const updatedSubmission = await this.updateSubmissionFromJudge0Result(
          submission.id, 
          judge0Result
        );
        
        return this.mapToResponseDto(updatedSubmission);

      } catch (error) {

        await this.submissionRepository.update(submission.id, {
          status: 'error'
        });
        
        throw new Error(`Failed to get submission result: ${error.message}`);
      }
    }

    return this.mapToResponseDto(submission);
  }

  private async updateSubmissionFromJudge0Result(submissionId: string, judge0Result: any) {
    const statusMapping = {
      1: 'pending',      // In Queue
      2: 'processing',   // Processing
      3: 'accepted',     // Accepted
      4: 'rejected',     // Wrong Answer
      5: 'time_limit_exceeded',
      6: 'compilation_error',
      7: 'error',        // Runtime Error (SIGSEGV)
      8: 'error',        // Runtime Error (SIGXFSZ)
      9: 'error',        // Runtime Error (SIGFPE)
      10: 'error',       // Runtime Error (SIGABRT)
      11: 'error',       // Runtime Error (NZEC)
      12: 'error',       // Runtime Error (Other)
      13: 'error',       // Internal Error
      14: 'error'        // Exec Format Error
    };

    const status = statusMapping[judge0Result.status.id] || 'error';
    const verdict = this.getVerdict(judge0Result.status.id, judge0Result.status.description);
    
    return await this.submissionRepository.update(submissionId, {
      status,
      output: judge0Result.stdout,
      executionTime: judge0Result.time ? parseFloat(judge0Result.time) : undefined,
      memoryUsage: judge0Result.memory,
      judge0Status: judge0Result.status,
      verdict
    });
  }

  private getVerdict(statusId: number, description: string): string {
    const verdictMapping = {
      3: 'Accepted',
      4: 'Wrong Answer',
      5: 'Time Limit Exceeded',
      6: 'Compilation Error'
    };
    return verdictMapping[statusId] || description;
  }

  // This is where the mapToResponseDto method goes:
  private mapToResponseDto(submission: any): SubmissionResponseDto {
    return {
      id: submission.id,
      userId: submission.userId,
      problemId: submission.problemId,
      status: submission.status,
      overallVerdict: submission.overallVerdict,
      testCaseResults: submission.testCaseResults.map((tcr: any) => ({
        testCaseId: tcr.testCaseId,
        status: tcr.status,
        executionTime: tcr.executionTime,
        memoryUsage: tcr.memoryUsage,
        // Only include input/output for failed visible test cases
        input: tcr.status !== 'passed' ? tcr.input : undefined,
        expectedOutput: tcr.status !== 'passed' ? tcr.expectedOutput : undefined,
        actualOutput: tcr.status !== 'passed' ? tcr.actualOutput : undefined
      })),
      testCasesPassed: submission.testCasesPassed,
      totalTestCases: submission.totalTestCases,
      score: submission.score,
      totalExecutionTime: submission.totalExecutionTime,
      maxMemoryUsage: submission.maxMemoryUsage,
      submittedAt: submission.createdAt,
      language: {
        id: submission.languageId,
        name: this.getLanguageName(submission.languageId)
      }
    };
  }

  private getLanguageName(languageId: number): string {
    const languages = {
      50: 'C (GCC 9.2.0)',
      54: 'C++ (GCC 9.2.0)',
      62: 'Java (OpenJDK 13.0.1)',
      71: 'Python (3.8.1)',
      63: 'JavaScript (Node.js 12.14.0)',
      78: 'Kotlin (1.3.70)',
      72: 'Ruby (2.7.0)',
      73: 'Rust (1.40.0)'
    };
    return languages[languageId] || 'Unknown';
  }
}
