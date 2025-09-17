


import { IJudge0Service } from '../../../domain/interfaces/services/IJudge0Service';
import { ISubmissionRepository } from '../../../domain/interfaces/repositories/ISubmissionRepository';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ExecuteCodeDto } from '../../dto/submissions/ExecuteCodeDto';
import { TestCaseResult } from '../../../domain/entities/Submission';
import { ITestCaseRepository } from '../../../domain/interfaces/repositories/ITestCaseRepository';
import { CodeExecutionHelperService } from '../../services/CodeExecutionHelperService';
import { SubmissionResponseDto } from '../../dto/submissions/SubmissionResponseDto';



export class CreateSubmissionUseCase {

  timeLimit = 10;
  memoryLimit = 262144;

  constructor(
    private judge0Service: IJudge0Service,
    private submissionRepository: ISubmissionRepository,
    private problemRepository: IProblemRepository,
    private testCaseRepository: ITestCaseRepository,
    private codeExecutionHelperService: CodeExecutionHelperService
  ) { }



  async execute(params: ExecuteCodeDto): Promise<SubmissionResponseDto> {


    const problem = await this.problemRepository.findById(params.problemId);

    if (!problem) {
      throw new Error('Problem not found');
    }

    const allTestCases = await this.testCaseRepository.findByProblemId(params.problemId);

    if (!allTestCases || allTestCases.length === 0) {
      throw new Error('Problem has no test cases');
    }

    const template = problem.templates[params.languageId]

    if (!template) {
      throw new Error(`Template not found for language:}`);
    }

    const code = this.codeExecutionHelperService.CombineCodeUseCase(template, params.sourceCode);


    const submission = await this.submissionRepository.create({
      userId: params.userId,
      problemId: params.problemId,
      sourceCode: code,
      languageId: params.languageId,
      status: 'pending',
      overallVerdict: 'Processing',
      testCaseResults: [],
      testCasesPassed: 0,
      totalTestCases: allTestCases.length,
      score: 0,
      totalExecutionTime: 0,
      maxMemoryUsage: 0,
      submissionType:params.submissionType
    });

    try {
      await this.submissionRepository.update(submission.id, {
        status: 'processing'
      });

      const testCaseResults = await this.executeAllTestCases(
        code,
        params.languageId,
        allTestCases,
        this.timeLimit,
        this.memoryLimit
      );

      const { verdict, status, score, totalTime, maxMemory } = this.codeExecutionHelperService.calculateResults(
        testCaseResults,
        100
        // problem.totalPoints || 100 // Use actual problem points with fallback
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
        id: submission.id,
        language: {
          id: params.languageId,
          name: "c"
        },
        maxMemoryUsage: updatedSubmission.maxMemoryUsage,
        overallVerdict: verdict,
        problemId: params.problemId,
        score: score,
        status: verdict,
        submittedAt: updatedSubmission.createdAt,
        testCaseResults: testCaseResults,
        testCasesPassed: testCaseResults.filter(tc => tc.status === 'passed').length,
        totalExecutionTime: totalTime,
        totalTestCases: testCaseResults.length,
        userId: params.userId
      }

    } catch (error) {
      await this.submissionRepository.update(submission.id, {
        status: 'error',
        overallVerdict: 'System Error'
      });

      throw new Error(`Code execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



















  private async executeAllTestCases(
    sourceCode: string,
    languageId: number,
    testCases: any[],
    timeLimit: number,
    memoryLimit: number
  ): Promise<TestCaseResult[]> {

    const submissions = await Promise.all(

      testCases.map(testCase => {

        const formattedInput = this.codeExecutionHelperService.formatTestCaseInput(testCase.inputs);

        return this.judge0Service.submitCode({
          source_code: sourceCode,
          language_id: languageId,
          stdin: formattedInput,
          expected_output: this.codeExecutionHelperService.formatExpectedOutput(testCase.expectedOutput),
          cpu_time_limit: timeLimit,
          memory_limit: memoryLimit,
          wall_time_limit: timeLimit + 1
        });
      })
    );

    const results = await Promise.all(
      submissions.map(async (submission, index) => {
        try {
          const result = await this.codeExecutionHelperService.waitForResult(submission.token);



          return {
            testCaseId: testCases[index].id,
            input: this.codeExecutionHelperService.formatTestCaseInput(testCases[index].inputs),
            expectedOutput: this.codeExecutionHelperService.formatExpectedOutput(testCases[index].expectedOutput),
            actualOutput: result.stdout?.trim(),
            status: this.codeExecutionHelperService.determineTestCaseStatus(result, this.codeExecutionHelperService.formatExpectedOutput(testCases[index].expectedOutput)),
            executionTime: result.time ? parseFloat(result.time) : 0,
            memoryUsage: result.memory || 0,
            judge0Token: submission.token,
            errorMessage: result.stderr || result.compile_output || null
          };

        } catch (error) {
          console.log("what error?", error);

          return {
            testCaseId: testCases[index].id,
            input: this.codeExecutionHelperService.formatTestCaseInput(testCases[index].inputs),
            expectedOutput: this.codeExecutionHelperService.formatExpectedOutput(testCases[index].expectedOutput),
            actualOutput: 'error catched',
            status: 'error' as const,
            executionTime: 0,
            memoryUsage: 0,
            judge0Token: submission.token,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return results;
  }


}
