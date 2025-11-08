

export interface TestCaseResult {
  errorMessage: any;
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  status: 'passed' | 'failed' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'compilation_error';
  executionTime?: number;
  memoryUsage?: number;
  judge0Token?: string;
}

export interface Submission {
  judge0Token: string;
  id: string;
  userId: string;
  problemId: string;
  sourceCode: string;
  languageId: number;
  status: 'pending' | 'processing' | 'accepted' | 'rejected' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'compilation_error';
  overallVerdict: string;
  testCaseResults: TestCaseResult[];
  testCasesPassed: number;
  totalTestCases: number;
  output: any;
  score: number;
  executionTime: any;
  totalExecutionTime: number;
  maxMemoryUsage: number;
  submissionType: 'problem' | 'contest' | 'room';
  createdAt: Date;
  updatedAt: Date;
  memoryUsage: any,
  judge0Status: any,
  verdict:any;
}
