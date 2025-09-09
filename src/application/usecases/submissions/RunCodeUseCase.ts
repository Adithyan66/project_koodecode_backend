
import { TestCaseResult } from "../../../domain/entities/Submission";
import { RunCodeDto, RunCodeResponseDto } from "../../dto/submissions/RunCodeDto";
import { IJudge0Service } from "../../interfaces/IJudge0Service";
import { IProblemRepository } from "../../interfaces/IProblemRepository";
import { ITestCaseRepository } from "../../interfaces/ITestCaseRepository";
import { CodeExecutionHelperService } from "../../services/CodeExecutionHelperService";




export class RunCodeUseCase {
  timeLimit = 10;
  memoryLimit = 262144;

  constructor(
    private judge0Service: IJudge0Service,
    private problemRepository: IProblemRepository,
    private testCaseRepository: ITestCaseRepository,
    private codeExecutionHelperService: CodeExecutionHelperService
  ) {}

  async execute(params: RunCodeDto): Promise<RunCodeResponseDto> {
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

    const allTestCases = await Promise.all(
      params.testCases.map(id => this.testCaseRepository.findById(id))
    );

    const validTestCases = allTestCases.filter(tc => tc !== null);
    if (validTestCases.length === 0) {
      throw new Error('No valid test cases found');
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
