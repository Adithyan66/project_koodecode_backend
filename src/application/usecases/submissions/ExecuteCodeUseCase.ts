


import { IJudge0Service } from '../../interfaces/IJudge0Service';
import { ISubmissionRepository } from '../../interfaces/ISubmissionRepository';
import { IProblemRepository } from '../../interfaces/IProblemRepository';
import { ExecuteCodeDto, ExecuteCodeResponseDto } from '../../dto/submissions/ExecuteCodeDto';
import { TestCaseResult } from '../../../domain/entities/Submission';
import { ITestCaseRepository } from '../../interfaces/ITestCaseRepository';

type SubmissionStatus =
  | "pending"
  | "processing"
  | "accepted"
  | "rejected"
  | "error"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "compilation_error"
  | "partially_accepted";


export class ExecuteCodeUseCase {
  constructor(
    private judge0Service: IJudge0Service,
    private submissionRepository: ISubmissionRepository,
    private problemRepository: IProblemRepository,
    private testCaseRepository: ITestCaseRepository,

  ) { }

  async execute(params: ExecuteCodeDto): Promise<ExecuteCodeResponseDto> {


    const problem = await this.problemRepository.findById(params.problemId);

    if (!problem) {
      throw new Error('Problem not found');
    }
    
    const allTestCases = await this.testCaseRepository.findByProblemId(params.problemId);
    
        if (!allTestCases || allTestCases.length === 0) {
          throw new Error('Problem has no test cases');
        }

    const submission = await this.submissionRepository.create({
      userId: params.userId,
      problemId: params.problemId,
      sourceCode: params.sourceCode,
      languageId: params.languageId,
      status: 'pending',
      overallVerdict: 'Processing',
      testCaseResults: [],
      testCasesPassed: 0,
      totalTestCases: allTestCases.length,
      score: 0,
      totalExecutionTime: 0,
      maxMemoryUsage: 0
    });

    try {
      await this.submissionRepository.update(submission.id, {
        status: 'processing'
      });

      const testCaseResults = await this.executeAllTestCases(
        params.sourceCode,
        params.languageId,
        allTestCases,
        // problem.timeLimit,
        // problem.memoryLimit
      );

      const { verdict, status, score, totalTime, maxMemory } = this.calculateResults(
        testCaseResults,
        // problem.totalPoints
        77
      );

      const updatedSubmission = await this.submissionRepository.update(submission.id, {
        status,
        overallVerdict: verdict,
        testCaseResults,
        testCasesPassed: testCaseResults.filter(tc => tc.status === 'passed').length,
        score,
        totalExecutionTime: totalTime,
        maxMemoryUsage: maxMemory
      });

      return {
        submissionId: submission.id,
        token: '',
        status: verdict
      };

    } catch (error) {

      await this.submissionRepository.update(submission.id, {
        status: 'error',
        overallVerdict: 'System Error'
      });
      
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }

  private async executeAllTestCases(
    sourceCode: string,
    languageId: number,
    testCases: any[],
    // timeLimit: number,
    // memoryLimit: number
  ): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    for (const testCase of testCases) {
      try {
        const judge0Response = await this.judge0Service.submitCode({
          source_code: sourceCode,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.expectedOutput,
          // cpu_time_limit: timeLimit,
          // memory_limit: memoryLimit,
          // wall_time_limit: timeLimit + 1
        });

        let result = await this.judge0Service.getSubmissionResult(judge0Response.token);
        let attempts = 0;
        while (result.status.id <= 2 && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = await this.judge0Service.getSubmissionResult(judge0Response.token);
          attempts++;
        }

        const testCaseResult: TestCaseResult = {
          testCaseId: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.stdout?.trim(),
          status: this.determineTestCaseStatus(result, testCase.expectedOutput),
          executionTime: result.time ? parseFloat(result.time) : 0,
          memoryUsage: result.memory || 0,
          judge0Token: judge0Response.token
        };

        results.push(testCaseResult);

        if (result.status.id === 6 || result.status.id >= 7) {
          // Fill remaining test cases as error
          const remainingTestCases = testCases.slice(results.length);
          for (const remaining of remainingTestCases) {
            results.push({
              testCaseId: remaining.id,
              input: remaining.input,
              expectedOutput: remaining.expectedOutput,
              status: 'error',
              executionTime: 0,
              memoryUsage: 0
            });
          }
          break;
        }
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          status: 'error',
          executionTime: 0,
          memoryUsage: 0
        });
      }
    }

    return results;
  }

  private determineTestCaseStatus(judge0Result: any, expectedOutput: string): 'passed' | 'failed' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded' {
    const statusId = judge0Result.status.id;

    switch (statusId) {
      case 3:
        return judge0Result.stdout?.trim() === expectedOutput.trim() ? 'passed' : 'failed';
      case 4:
        return 'failed';
      case 5: return 'time_limit_exceeded';
      case 6: // Compilation Error
      case 7: // Runtime Error (SIGSEGV)
      case 8: // Runtime Error (SIGXFSZ)
      case 9: // Runtime Error (SIGFPE)
      case 10: // Runtime Error (SIGABRT)
      case 11: // Runtime Error (NZEC)
      case 12: // Runtime Error (Other)
      case 13: // Internal Error
      case 14: // Exec Format Error
        return 'error';
      default:
        return 'error';
    }
  }

  private calculateResults(testCaseResults: TestCaseResult[], totalPoints: number) {


    const passedCount = testCaseResults.filter(tc => tc.status === 'passed').length;
    const totalCount = testCaseResults.length;
    const hasCompilationError = testCaseResults.some(tc => tc.status === 'error');
    const hasTimeLimit = testCaseResults.some(tc => tc.status === 'time_limit_exceeded');
    const hasMemoryLimit = testCaseResults.some(tc => tc.status === 'memory_limit_exceeded');

    let verdict: string;
    let status: SubmissionStatus;

    if (hasCompilationError) {
      verdict = 'Compilation Error';
      status = 'compilation_error';
    } else if (hasTimeLimit) {
      verdict = 'Time Limit Exceeded';
      status = 'time_limit_exceeded';
    } else if (hasMemoryLimit) {
      verdict = 'Memory Limit Exceeded';
      status = 'memory_limit_exceeded';
    } else if (passedCount === totalCount) {
      verdict = 'Accepted';
      status = 'accepted';
    } else if (passedCount > 0) {
      verdict = `Partially Accepted (${passedCount}/${totalCount})`;
      status = 'partially_accepted';
    } else {
      verdict = 'Wrong Answer';
      status = 'rejected';
    }

    const score = Math.round((passedCount / totalCount) * totalPoints);
    const totalTime = testCaseResults.reduce((sum, tc) => sum + (tc.executionTime || 0), 0);
    const maxMemory = Math.max(...testCaseResults.map(tc => tc.memoryUsage || 0));

    return { verdict, status, score, totalTime, maxMemory };
  }
}
