
export interface TestCaseResultDto {
  testCaseId: string;
  status: string;
  executionTime?: number;
  memoryUsage?: number;
  input?: string; // Only for sample test cases
  expectedOutput?: string; // Only for sample test cases
  actualOutput?: string; // Only if test case failed and is visible
}

export interface DistributionDataPoint {
  runtime?: number;
  memory?: number;
  percentage: number;
}

export interface RuntimeDistribution {
  data: DistributionDataPoint[];
  userRuntime: number;
  beats: number;
}

export interface MemoryDistribution {
  data: DistributionDataPoint[];
  userMemory: number;
  beats: number;
}

export interface SubmissionResponseDto {
  id: string;
  userId: string;
  problemId: string;
  status: string;
  overallVerdict: string;
  testCaseResults?: TestCaseResultDto[];
  testCasesPassed: number;
  totalTestCases: number;
  score: number;
  totalExecutionTime: number;
  maxMemoryUsage: number;
  submittedAt: Date;
  code: string;
  language: {
    id: number;
    name: string;
    
  };
  runtimeDistribution?: RuntimeDistribution;
  memoryDistribution?: MemoryDistribution;
}
