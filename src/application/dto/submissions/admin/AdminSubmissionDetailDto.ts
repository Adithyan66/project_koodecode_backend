
export interface TestCaseResultDto {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  status: 'passed' | 'failed' | 'error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'compilation_error';
  executionTime?: number;
  memoryUsage?: number;
  judge0Token?: string;
  errorMessage?: string;
}

export interface AdminSubmissionDetailDto {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
  };
  problem: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    problemNumber?: number;
  };
  sourceCode: string;
  language: {
    id: number;
    name: string;
    extension: string;
  };
  status: string;
  overallVerdict: string;
  score: number;
  testCaseResults: TestCaseResultDto[];
  testCasesPassed: number;
  totalTestCases: number;
  performanceMetrics: {
    totalExecutionTime: number;
    maxMemoryUsage: number;
    averageExecutionTime: number;
    averageMemoryUsage: number;
  };
  submissionType: 'problem' | 'contest';
  judge0Token?: string;
  judge0Status?: any;
  createdAt: Date;
  updatedAt: Date;
}

