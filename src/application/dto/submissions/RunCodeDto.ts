// export interface RunCodeDto {
//     problemId: string;
//     code: string;
//     language: string;
//     testCaseIds?: string[]; // Run specific test cases
// }


export interface RunCodeDto {
  sourceCode: string;
  languageId: number;
  problemId?: string;
  stdin?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface RunCodeResponseDto {
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsage?: number;
  status: string;
  compileOutput?: string;
  verdict?: string;
}
