
import { TestCaseResult } from "../../../domain/entities/Submission";
import { RunCodeDto, RunCodeResponseDto } from "../../dto/submissions/RunCodeDto";
import { IJudge0Service } from "../../../domain/interfaces/services/IJudge0Service";
import { IProblemRepository } from "../../../domain/interfaces/repositories/IProblemRepository";
import { ITestCaseRepository } from "../../../domain/interfaces/repositories/ITestCaseRepository";
import { CodeExecutionHelperService } from "../../services/CodeExecutionHelperService";




export class RunCodeUseCase {
  timeLimit = 10;
  memoryLimit = 262144;

  constructor(
    private judge0Service: IJudge0Service,
    private problemRepository: IProblemRepository,
    private testCaseRepository: ITestCaseRepository,
    private codeExecutionHelperService: CodeExecutionHelperService
  ) { }

  async execute(params: RunCodeDto): Promise<RunCodeResponseDto> {

    const problem = await this.problemRepository.findById(params.problemId);

    if (!problem) {
      throw new Error('Problem not found');
    }

    const allTestCases = await Promise.all(
      params.testCases.map(id => this.testCaseRepository.findById(id))
    );

    const validTestCases = allTestCases.filter((tc: any) => tc !== null);
    if (validTestCases.length === 0) {
      throw new Error('No valid test cases found');
    }

    const template = problem.templates[params.languageId]

    if (!template) {
      throw new Error(`Template not found for language:}`);
    }


    const code = this.codeExecutionHelperService.CombineCodeUseCase(template, params.sourceCode);

    const testCaseResults = await this.executeAllTestCases(
      code,
      params.languageId,
      validTestCases,
      this.timeLimit,
      this.memoryLimit
    );

    const { verdict, status, score, totalTime, maxMemory } = this.codeExecutionHelperService.calculateResults(
      testCaseResults,
      100
    );

    return {
      verdict,
      status,
      score,
      totalTime,
      maxMemory,
      testCaseResults,
      totalTestCases: testCaseResults.length,
      passedTestCases: testCaseResults.filter(r => r.status === 'passed').length,
      failedTestCases: testCaseResults.filter(r => r.status === 'failed').length
    };
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

          console.log("Starting waitForResult for submission", index);
          
          const result = await this.codeExecutionHelperService.waitForResult(submission.token);

          console.log("waitForResult output:", result);


          const expectedOut = this.codeExecutionHelperService.formatExpectedOutput(testCases[index].expectedOutput)

          const status = this.codeExecutionHelperService.determineTestCaseStatus(result, expectedOut)

          return {
            testCaseId: testCases[index].id,
            input: this.codeExecutionHelperService.formatTestCaseInput(testCases[index].inputs),
            expectedOutput: this.codeExecutionHelperService.formatExpectedOutput(testCases[index].expectedOutput),
            actualOutput: result.stdout?.trim(),
            status,
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
