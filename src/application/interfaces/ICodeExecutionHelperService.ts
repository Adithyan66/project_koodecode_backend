import { TestCaseResult } from "../../domain/entities/Submission";
import { SubmissionStatus } from "../services/CodeExecutionHelperService";

export interface ICodeExecutionHelperService {
  CombineCodeUseCase(template: any, userCode: string): string;
  waitForResult(token: string, maxAttempts?: number): Promise<any>;
  determineTestCaseStatus(judge0Result: any, expectedOutput: string): 'passed' | 'failed' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'compilation_error';
  compareOutputs(actualOutput: string | null, expectedOutput: string): boolean;
  formatTestCaseInput(inputs: any): string;
  formatExpectedOutput(expectedOutput: any): string;
  calculateResults(testCaseResults: TestCaseResult[], totalPoints: number): { verdict: string; status: SubmissionStatus; score: number; totalTime: number; maxMemory: number };
}
