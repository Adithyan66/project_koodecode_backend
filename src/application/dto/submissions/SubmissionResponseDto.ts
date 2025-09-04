// // // export interface SubmissionResponseDto {
// // //     id: string;
// // //     problemId: string;
// // //     problemTitle: string;
// // //     code: string;
// // //     language: string;
// // //     status: string;
// // //     testResults: TestResultDto[];
// // //     executionTime?: number;
// // //     memoryUsage?: number;
// // //     createdAt: string;
// // //     submittedAt?: string;
// // // }

// // // export interface TestResultDto {
// // //     testCaseId: string;
// // //     input: any;
// // //     expectedOutput: any;
// // //     actualOutput?: any;
// // //     passed: boolean;
// // //     executionTime?: number;
// // //     memoryUsage?: number;
// // //     error?: string;
// // // }

// // export interface SubmissionResponseDto {
// //   id: string;
// //   userId: string;
// //   problemId: string;
// //   status: string;
// //   verdict?: string;
// //   executionTime?: number;
// //   memoryUsage?: number;
// //   output?: string;
// //   testCasesPassed?: number;
// //   totalTestCases?: number;
// //   submittedAt: Date;
// //   language: {
// //     id: number;
// //     name: string;
// //   };
// // }



// export interface TestCaseResultDto {
//   testCaseId: string;
//   status: string;
//   executionTime?: number;
//   memoryUsage?: number;
//   input?: string; // Only for sample test cases
//   expectedOutput?: string; // Only for sample test cases
//   actualOutput?: string; // Only if test case failed and is visible
// }

// export interface SubmissionResponseDto {
//   id: string;
//   userId: string;
//   problemId: string;
//   status: string;
//   overallVerdict: string;
//   testCaseResults: TestCaseResultDto[];
//   testCasesPassed: number;
//   totalTestCases: number;
//   score: number;
//   totalExecutionTime: number;
//   maxMemoryUsage: number;
//   submittedAt: Date;
//   language: {
//     id: number;
//     name: string;
//   };
// }


export interface TestCaseResultDto {
  testCaseId: string;
  status: string;
  executionTime?: number;
  memoryUsage?: number;
  input?: string; // Only for sample test cases
  expectedOutput?: string; // Only for sample test cases
  actualOutput?: string; // Only if test case failed and is visible
}

export interface SubmissionResponseDto {
  id: string;
  userId: string;
  problemId: string;
  status: string;
  overallVerdict: string;
  testCaseResults: TestCaseResultDto[];
  testCasesPassed: number;
  totalTestCases: number;
  score: number;
  totalExecutionTime: number;
  maxMemoryUsage: number;
  submittedAt: Date;
  language: {
    id: number;
    name: string;
  };
}
