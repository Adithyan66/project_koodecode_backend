export interface Judge0SubmissionDto {
  sourceCode: string;
  languageId: number;
  stdin?: string;
  expectedOutput?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface Judge0ResultDto {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  executionTime?: number;
  memoryUsage?: number;
  message?: string;
}
