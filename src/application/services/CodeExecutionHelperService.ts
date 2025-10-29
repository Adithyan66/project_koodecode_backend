import { inject, injectable } from "tsyringe";
import { TestCaseResult } from "../../domain/entities/Submission";
import { ICodeExecutionService } from "../../domain/interfaces/services/IJudge0Service";
import { ICodeExecutionHelperService } from "../interfaces/ICodeExecutionHelperService";

export type SubmissionStatus =
  | "pending"
  | "processing"
  | "accepted"
  | "rejected"
  | "error"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "compilation_error"
;


@injectable()
export class CodeExecutionHelperService implements ICodeExecutionHelperService {


  constructor(
    @inject("ICodeExecutionService") private judge0Service: ICodeExecutionService
  ) { }


  CombineCodeUseCase(template: any, userCode: string): string {
    const combinedCode = template.templateCode.replace(template.placeholder, userCode);
    return combinedCode;
  }



  async waitForResult(token: string, maxAttempts: number = 15): Promise<any> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const result = await this.judge0Service.getSubmissionResult(token);

      if (result.status?.id > 2 || result.status.id > 2) {
        return result;
      }

      // console.log(`Attempt ${attempts + 1}: Status ${result.status?.id || result.status_id}`);

      const delay = Math.min(500 + (attempts * 200), 2000);

      await new Promise(resolve => setTimeout(resolve, delay));

      attempts++;
    }

    throw new Error(`Submission ${token} timed out after ${maxAttempts} attempts`);
  }


  determineTestCaseStatus(
    judge0Result: any,
    expectedOutput: string
  ): 'passed' | 'failed' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded'|'compilation_error' {

    const statusId = judge0Result.status?.id || judge0Result.status_id;
    console.log(`Judge0 status ID: ${statusId}, description: ${judge0Result.status?.description || 'N/A'}`);

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
        console.log('COMPILATION ERROR DETECTED - returning compilation_error status');
        return 'compilation_error';
      case 7: // Runtime Error (SIGSEGV)
      case 8: // Runtime Error (SIGXFSZ)`
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

  compareOutputs(actualOutput: string | null, expectedOutput: string): boolean {
    if (!actualOutput) return !expectedOutput || expectedOutput.trim() === '';

    const normalizeOutput = (output: string) =>
      output
        .replace(/\r\n/g, '\n') // Normalize Windows line endings
        .replace(/\r/g, '\n')   // Normalize old Mac line endings
        .replace(/\s+/g, '')    // Remove all whitespace (spaces, tabs, etc.)
        .trim();                // Trim any remaining leading/trailing whitespace

    return normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);
  }

  formatTestCaseInput(inputs: any): string {

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

  formatExpectedOutput(expectedOutput: any): string {

    if (typeof expectedOutput === 'string') {
      return expectedOutput.trim();
    }

    if (Array.isArray(expectedOutput)) {
      return `[${expectedOutput.join(',')}]`;
    }

    if (typeof expectedOutput === 'object' && expectedOutput !== null) {
      return JSON.stringify(expectedOutput);
    }

    return String(expectedOutput);
  }

  calculateResults(testCaseResults: TestCaseResult[], totalPoints: number) {
    console.log('Calculating results for test cases:', testCaseResults.map(tc => ({ id: tc.testCaseId, status: tc.status })));

    const passedCount = testCaseResults.filter(tc => tc.status === 'passed').length;
    const totalCount = testCaseResults.length;
    
    // Check for compilation errors by status, not by error message
    const hasCompilationError = testCaseResults.some(tc => tc.status === 'compilation_error');
    const hasRuntimeError = testCaseResults.some(tc => tc.status === 'error');
    const hasTimeLimit = testCaseResults.some(tc => tc.status === 'time_limit_exceeded');
    const hasMemoryLimit = testCaseResults.some(tc => tc.status === 'memory_limit_exceeded');

    console.log('Error flags:', { hasCompilationError, hasRuntimeError, hasTimeLimit, hasMemoryLimit });

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
    } else {
      verdict = 'Wrong Answer';
      status = 'rejected';
    }

    console.log('Final verdict:', verdict, 'status:', status);

    const score = Math.round((passedCount / totalCount) * totalPoints);
    const totalTime = testCaseResults.reduce((sum, tc) => sum + (tc.executionTime || 0), 0);
    const maxMemory = Math.max(...testCaseResults.map(tc => tc.memoryUsage || 0), 0);

    return { verdict, status, score, totalTime, maxMemory };
  }
}

