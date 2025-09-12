


import { IJudge0Service } from '../../../domain/interfaces/services/IJudge0Service';
import { ISubmissionRepository } from '../../../domain/interfaces/repositories/ISubmissionRepository';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ExecuteCodeDto } from '../../dto/submissions/ExecuteCodeDto';
import { TestCaseResult } from '../../../domain/entities/Submission';
import { ITestCaseRepository } from '../../interfaces/ITestCaseRepository';
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


    const templates = {
      c: {
        templateCode: `#include <stdio.h>
#include <stdlib.h>

USER_FUNCTION_PLACEHOLDER

int main() {
    int nums[1000];
    int count = 0;
    int num;
    char ch;

    // Read numbers until newline
    while (scanf("%d", &num) == 1) {
        nums[count++] = num;
        ch = getchar();
        if (ch == '\\n') break;
    }

    // Read target value
    int target;
    scanf("%d", &target);

    // Call twoSum function
    int returnSize;
    int* result = twoSum(nums, count, target, &returnSize);

    if (result != NULL) {
        printf("[%d,%d]", result[0], result[1]);
        free(result);
    } else {
        printf("[]");
    }

    return 0;
}`,
        userFunctionSignature: "int* twoSum(int* nums, int numsSize, int target, int* returnSize)",
        placeholder: "USER_FUNCTION_PLACEHOLDER"
      },
      python: {
        templateCode: `import sys

USER_FUNCTION_PLACEHOLDER

if __name__ == "__main__":
    # Read input from stdin
    lines = sys.stdin.read().strip().split('\\n')
    
    # Parse the array
    nums = list(map(int, lines[0].split()))
    
    # Parse the target
    target = int(lines[1])
    
    # Create solution instance and call twoSum
    solution = Solution()
    result = solution.twoSum(nums, target)
    
    # Print result
    print(f"[{result[0]},{result[1]}]")`,
        userFunctionSignature: "def twoSum(self, nums: List[int], target: int) -> List[int]:",
        placeholder: "USER_FUNCTION_PLACEHOLDER"
      }
    };

    const problem = await this.problemRepository.findById(params.problemId);

    if (!problem) {
      throw new Error('Problem not found');
    }

    const allTestCases = await this.testCaseRepository.findByProblemId(params.problemId);

    if (!allTestCases || allTestCases.length === 0) {
      throw new Error('Problem has no test cases');
    }

    const languageMap: { [key: number]: keyof typeof templates } = {
      50: "c",
      71: "python"
    };

    const languageKey = languageMap[params.languageId];

    if (!languageKey) {
      throw new Error(`Unsupported language ID: ${params.languageId}`);
    }

    const template = templates[languageKey];

    if (!template) {
      throw new Error(`Template not found for language: ${languageKey}`);
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
      maxMemoryUsage: 0
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

      // if (updatedSubmission.isAccepted) {
      //   await this.userStatsService.updateProblemStats(
      //     submission.userId,
      //     submission.problem.difficulty
      //   );
      // }

      // // Update acceptance rate
      // const userSubmissions = await this.submissionRepository.findByUserId(submission.userId);
      // const acceptedSubmissions = userSubmissions.filter(s => s.isAccepted).length;

      // await this.userStatsService.calculateAcceptanceRate(
      //   submission.userId,
      //   userSubmissions.length,
      //   acceptedSubmissions
      // );


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

        console.log("formattedInput", formattedInput);


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

    console.log("results", results);
    return results;
  }


}
