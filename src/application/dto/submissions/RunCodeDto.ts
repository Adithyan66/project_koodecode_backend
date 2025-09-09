// export interface RunCodeDto {
//     problemId: string;
//     code: string;
//     language: string;
//     testCaseIds?: string[]; // Run specific test cases
// }


export interface RunCodeDto {
  sourceCode: string;
  languageId: number;
  problemId: string;
  testCases: string[]
  userId: string
}

// export interface RunCodeResponseDto {
//   output?: string;
//   error?: string;
//   executionTime?: number;
//   memoryUsage?: number;
//   score:Number;
//   status: string;
//   compileOutput?: string;
//   verdict?: string;
// }


export interface RunCodeResponseDto {
  verdict: string;
  status:string;
  score:number;
  totalTime: number;
  maxMemory: number
  testCaseResults: any
  totalTestCases: any
  passedTestCases: number
  failedTestCases: number
}