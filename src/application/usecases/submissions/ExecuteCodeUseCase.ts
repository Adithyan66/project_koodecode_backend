


// import { IJudge0Service } from '../../interfaces/IJudge0Service';
// import { ISubmissionRepository } from '../../interfaces/ISubmissionRepository';
// import { IProblemRepository } from '../../interfaces/IProblemRepository';
// import { ExecuteCodeDto, ExecuteCodeResponseDto } from '../../dto/submissions/ExecuteCodeDto';
// import { TestCaseResult } from '../../../domain/entities/Submission';
// import { ITestCaseRepository } from '../../interfaces/ITestCaseRepository';

// type SubmissionStatus =
//   | "pending"
//   | "processing"
//   | "accepted"
//   | "rejected"
//   | "error"
//   | "time_limit_exceeded"
//   | "memory_limit_exceeded"
//   | "compilation_error"
//   | "partially_accepted";


// export class ExecuteCodeUseCase {

//   timeLimit = 10;
//   memoryLimit = 262144;

//   constructor(
//     private judge0Service: IJudge0Service,
//     private submissionRepository: ISubmissionRepository,
//     private problemRepository: IProblemRepository,
//     private testCaseRepository: ITestCaseRepository,

//   ) { }

//   async execute(params: ExecuteCodeDto): Promise<ExecuteCodeResponseDto> {


//     const problem = await this.problemRepository.findById(params.problemId);

//     if (!problem) {
//       throw new Error('Problem not found');
//     }

//     const allTestCases = await this.testCaseRepository.findByProblemId(params.problemId);

//     if (!allTestCases || allTestCases.length === 0) {
//       throw new Error('Problem has no test cases');
//     }

//     const submission = await this.submissionRepository.create({
//       userId: params.userId,
//       problemId: params.problemId,
//       sourceCode: params.sourceCode,
//       languageId: params.languageId,
//       status: 'pending',
//       overallVerdict: 'Processing',
//       testCaseResults: [],
//       testCasesPassed: 0,
//       totalTestCases: allTestCases.length,
//       score: 0,
//       totalExecutionTime: 0,
//       maxMemoryUsage: 0
//     });

//     try {
//       await this.submissionRepository.update(submission.id, {
//         status: 'processing'
//       });

//       const testCaseResults = await this.executeAllTestCases(
//         params.sourceCode,
//         params.languageId,
//         allTestCases,
//         this.timeLimit,
//         this.memoryLimit
//       );


//       const { verdict, status, score, totalTime, maxMemory } = this.calculateResults(
//         testCaseResults,
//         // problem.totalPoints
//         77
//       );

//       const updatedSubmission = await this.submissionRepository.update(submission.id, {
//         status,
//         overallVerdict: verdict,
//         testCaseResults,
//         testCasesPassed: testCaseResults.filter(tc => tc.status === 'passed').length,
//         score,
//         totalExecutionTime: totalTime,
//         maxMemoryUsage: maxMemory
//       });

//       return {
//         submissionId: submission.id,
//         token: '',
//         status: verdict
//       };

//     } catch (error) {

//       await this.submissionRepository.update(submission.id, {
//         status: 'error',
//         overallVerdict: 'System Error'

//       });

//       throw new Error(`Code execution failed: ${error.message}`);
//     }
//   }


//   private async executeAllTestCases(
//     sourceCode: string,
//     languageId: number,
//     testCases: any[],
//     timeLimit: number,
//     memoryLimit: number
//   ): Promise<TestCaseResult[]> {

//     const submissions = await Promise.all(
//       testCases.map(testCase => {

//         return this.judge0Service.submitCode({
//           source_code: sourceCode,
//           language_id: languageId,
//           stdin: Object.values(testCase.inputs).join(" "),
//           expected_output: String(testCase.expectedOutput),
//           cpu_time_limit: timeLimit,
//           memory_limit: memoryLimit,
//           wall_time_limit: timeLimit + 1
//         })
//       }
//       )
//     );

//     console.log("submissions", submissions);


//     const results = await Promise.all(

//       submissions.map(async (submission, index) => {

//         const result = await this.waitForResult(submission.token);

//         return {
//           testCaseId: testCases[index].id,
//           input: Object.values(testCases[index].inputs).join(" "),
//           expectedOutput: String(testCases[index].expectedOutput),
//           actualOutput: result.stdout?.trim(),
//           status: this.determineTestCaseStatus(result, testCases[index].expectedOutput),
//           executionTime: result.time ? parseFloat(result.time) : 0,
//           memoryUsage: result.memory || 0,
//           judge0Token: submission.token
//         };

//       })
//     );

//     console.log("results",results);


//     return results;
//   }


//   private async waitForResult(token: string, maxAttempts: number = 10): Promise<any> {

//     let attempts = 0;

//     while (attempts < maxAttempts) {
//       const result = await this.judge0Service.getSubmissionResult(token);

//       if (result.status_id > 2) {
//         return result;
//       }

//       console.log(`Attempt ${attempts + 1}: Status ${result.status_id}`);
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       attempts++;
//     }

//     throw new Error(`Submission ${token} timed out after ${maxAttempts} attempts`);
//   }


//   private determineTestCaseStatus(judge0Result: any, expectedOutput: string): 'passed' | 'failed' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded' {
//     const statusId = judge0Result.status.id;

//     switch (statusId) {
//       case 3:
//         return judge0Result.stdout?.trim() === expectedOutput.trim() ? 'passed' : 'failed';
//       case 4:
//         return 'failed';
//       case 5: return 'time_limit_exceeded';
//       case 6: // Compilation Error
//       case 7: // Runtime Error (SIGSEGV)
//       case 8: // Runtime Error (SIGXFSZ)
//       case 9: // Runtime Error (SIGFPE)
//       case 10: // Runtime Error (SIGABRT)
//       case 11: // Runtime Error (NZEC)
//       case 12: // Runtime Error (Other)
//       case 13: // Internal Error
//       case 14: // Exec Format Error
//         return 'error';
//       default:
//         return 'error';
//     }
//   }

//   private calculateResults(testCaseResults: TestCaseResult[], totalPoints: number) {


//     const passedCount = testCaseResults.filter(tc => tc.status === 'passed').length;
//     const totalCount = testCaseResults.length;
//     const hasCompilationError = testCaseResults.some(tc => tc.status === 'error');
//     const hasTimeLimit = testCaseResults.some(tc => tc.status === 'time_limit_exceeded');
//     const hasMemoryLimit = testCaseResults.some(tc => tc.status === 'memory_limit_exceeded');

//     let verdict: string;
//     let status: SubmissionStatus;

//     if (hasCompilationError) {
//       verdict = 'Compilation Error';
//       status = 'compilation_error';
//     } else if (hasTimeLimit) {
//       verdict = 'Time Limit Exceeded';
//       status = 'time_limit_exceeded';
//     } else if (hasMemoryLimit) {
//       verdict = 'Memory Limit Exceeded';
//       status = 'memory_limit_exceeded';
//     } else if (passedCount === totalCount) {
//       verdict = 'Accepted';
//       status = 'accepted';
//     } else if (passedCount > 0) {
//       verdict = `Partially Accepted (${passedCount}/${totalCount})`;
//       status = 'partially_accepted';
//     } else {
//       verdict = 'Wrong Answer';
//       status = 'rejected';
//     }

//     const score = Math.round((passedCount / totalCount) * totalPoints);
//     const totalTime = testCaseResults.reduce((sum, tc) => sum + (tc.executionTime || 0), 0);
//     const maxMemory = Math.max(...testCaseResults.map(tc => tc.memoryUsage || 0));

//     return { verdict, status, score, totalTime, maxMemory };
//   }
// }






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
  timeLimit = 10;
  memoryLimit = 262144;

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
        this.timeLimit,
        this.memoryLimit
      );

      const { verdict, status, score, totalTime, maxMemory } = this.calculateResults(
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
        submissionId: submission.id,
        token: '',
        status: verdict
      };

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

        const formattedInput = this.formatTestCaseInput(testCase.inputs);

        console.log("formattedInput", formattedInput);


        return this.judge0Service.submitCode({
          source_code: sourceCode,
          language_id: languageId,
          stdin: formattedInput,
          // expected_output: String(testCase.expectedOutput),
          expected_output: this.formatExpectedOutput(testCase.expectedOutput),
          cpu_time_limit: timeLimit,
          memory_limit: memoryLimit,
          wall_time_limit: timeLimit + 1
        });
      })
    );

    // console.log("submissions", submissions);

    const results = await Promise.all(
      submissions.map(async (submission, index) => {
        try {
          const result = await this.waitForResult(submission.token);

          // console.log("result at wait for result", result);


          return {
            testCaseId: testCases[index].id,
            input: this.formatTestCaseInput(testCases[index].inputs),
            // expectedOutput: String(testCases[index].expectedOutput),
            expectedOutput: this.formatExpectedOutput(testCases[index].expectedOutput),
            actualOutput: result.stdout?.trim(),
            // status: this.determineTestCaseStatus(result, String(testCases[index].expectedOutput)),
            status: this.determineTestCaseStatus(result, this.formatExpectedOutput(testCases[index].expectedOutput)),
            executionTime: result.time ? parseFloat(result.time) : 0,
            memoryUsage: result.memory || 0,
            judge0Token: submission.token,
            errorMessage: result.stderr || result.compile_output || null
          };

        } catch (error) {
          console.log("what error?", error);

          return {
            testCaseId: testCases[index].id,
            input: this.formatTestCaseInput(testCases[index].inputs),
            // expectedOutput: String(testCases[index].expectedOutput),
            expectedOutput: this.formatExpectedOutput(testCases[index].expectedOutput),
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

  private async waitForResult(token: string, maxAttempts: number = 15): Promise<any> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const result = await this.judge0Service.getSubmissionResult(token);

      // Status IDs: 1 = In Queue, 2 = Processing, >2 = Completed
      if (result.status?.id > 2 || result.status.id > 2) {
        return result;
      }

      console.log(`Attempt ${attempts + 1}: Status ${result.status?.id || result.status_id}`);

      // Progressive delay: start with 500ms, increase to 2s
      const delay = Math.min(500 + (attempts * 200), 2000);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempts++;
    }

    throw new Error(`Submission ${token} timed out after ${maxAttempts} attempts`);
  }

  private determineTestCaseStatus(
    judge0Result: any,
    expectedOutput: string
  ): 'passed' | 'failed' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded' {
    // Handle both status.id and status_id formats
    const statusId = judge0Result.status?.id || judge0Result.status_id;

    switch (statusId) {
      case 3: // Accepted
        return this.compareOutputs(judge0Result.stdout, expectedOutput) ? 'passed' : 'failed';
      case 4: // Wrong Answer
        return 'failed';
      case 5: // Time Limit Exceeded
        return 'time_limit_exceeded';
      case 17: // Memory Limit Exceeded
      case 18: // Memory Limit Exceeded (wall time)
        return 'memory_limit_exceeded';
      case 6: // Compilation Error
        return 'error';
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
        console.warn(`Unknown Judge0 status ID: ${statusId}`);
        return 'error';
    }
  }






  private compareOutputs(actualOutput: string | null, expectedOutput: string): boolean {

    console.log("actual output", typeof expectedOutput);

    if (!actualOutput) return !expectedOutput || expectedOutput.trim() === '';

    const normalizeOutput = (output: string) =>

      output.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

    return normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);

  }


  private formatTestCaseInput(inputs: any): string {

    if (typeof inputs === 'string') {
      return inputs;
    }

    if (typeof inputs === 'object' && inputs !== null) {

      if (Array.isArray(inputs)) {
        return inputs.map(item => {
          if (Array.isArray(item)) {
            return item.join(' ');
          }
          return String(item);
        }).join('\n');
      } else {

        const values = Object.values(inputs);
        return values.map(value => {
          if (Array.isArray(value)) {
            return value.join(' ');
          }
          return String(value);
        }).join('\n');
      }
    }

    return String(inputs);
  }


  private formatExpectedOutput(expectedOutput: any): string {
    console.log("expectedOutput ", expectedOutput);

    // If it's already a string, return as-is
    if (typeof expectedOutput === 'string') {
      return expectedOutput.trim();
    }

    // Handle arrays - format as JSON-like string
    if (Array.isArray(expectedOutput)) {
      return `[${expectedOutput.join(',')}]`;
    }

    // Handle objects - convert to JSON string
    if (typeof expectedOutput === 'object' && expectedOutput !== null) {
      return JSON.stringify(expectedOutput);
    }

    // Handle primitive types (numbers, booleans)
    return String(expectedOutput);
  }


  private calculateResults(testCaseResults: TestCaseResult[], totalPoints: number) {
    const passedCount = testCaseResults.filter(tc => tc.status === 'passed').length;
    const totalCount = testCaseResults.length;
    const hasCompilationError = testCaseResults.some(tc => tc.status === 'error' && tc.errorMessage?.toLowerCase().includes('compilation'));
    const hasRuntimeError = testCaseResults.some(tc => tc.status === 'error' && !tc.errorMessage?.toLowerCase().includes('compilation'));
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
    } else if (hasRuntimeError) {
      verdict = 'Runtime Error';
      status = 'error';
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
    const maxMemory = Math.max(...testCaseResults.map(tc => tc.memoryUsage || 0), 0);

    return { verdict, status, score, totalTime, maxMemory };
  }
}
