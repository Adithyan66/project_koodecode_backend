

// // export class Submission {
// //     constructor(
// //         public readonly id: string,
// //         public readonly problemId: string,
// //         public readonly userId: string,
// //         public readonly code: string,
// //         public readonly language: string,
// //         public readonly status: 'pending' | 'running' | 'accepted' | 'rejected' | 'error',
// //         public readonly testResults: TestResult[],
// //         public readonly executionTime?: number,
// //         public readonly memoryUsage?: number,
// //         public readonly createdAt: Date = new Date(),
// //         public readonly submittedAt?: Date
// //     ) {}
// // }


// // export interface TestResult {
//     //     testCaseId: string;
//     //     input: any;
// //     expectedOutput: any;
// //     actualOutput?: any;
// //     passed: boolean;
// //     executionTime?: number;
// //     memoryUsage?: number;
// //     error?: string;
// // }


// import { Judge0Status } from "./Judge0Submission";


// export interface Submission {
//   id: string;
//   userId: string;
//   problemId: string;
//   sourceCode: string;
//   languageId: number;
//   status: 'pending' | 'processing' | 'accepted' | 'rejected' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'compilation_error';
//   executionTime?: number;
//   memoryUsage?: number;
//   output?: string;
//   expectedOutput: string;
//   judge0Token?: string;
//   judge0Status?: Judge0Status;
//   testCasesPassed?: number;
//   totalTestCases?: number;
//   verdict?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }



export interface TestCaseResult {
  errorMessage: any;
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  status: 'passed' | 'failed' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded';
  executionTime?: number;
  memoryUsage?: number;
  judge0Token?: string;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  sourceCode: string;
  languageId: number;
  status: 'pending' | 'processing' | 'accepted' | 'rejected' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'compilation_error' | 'partially_accepted';
  overallVerdict: string;
  testCaseResults: TestCaseResult[]; 
  testCasesPassed: number;
  totalTestCases: number;
  score: number; 
  totalExecutionTime: number;
  maxMemoryUsage: number;
  createdAt: Date;
  updatedAt: Date;
}
