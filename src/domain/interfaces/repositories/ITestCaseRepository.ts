

import { TestCase } from '../../entities/TestCase';

export interface TestCaseDto {
  id: string;
  problemId: string;
  inputs: any;
  expectedOutput: any;
  isSample: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestCaseListRequestDto {
  problemId: string;
  page?: number;
  limit?: number;
  isSample?: boolean; // Optional filter for sample/non-sample test cases
}

export interface TestCaseListResponseDto {
  testCases: TestCaseDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedTestCases {
    testCases: TestCase[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ITestCaseRepository {
    create(testCase: TestCase): Promise<TestCase>;
    createMany(testCases: TestCase[]): Promise<TestCase[]>;
    findByProblemId(problemId: string): Promise<TestCase[]>;
    findSampleByProblemId(problemId: string): Promise<TestCase[]>;
    findNonSampleByProblemId(problemId: string): Promise<TestCase[]>;
    findById(id: string): Promise<TestCase | null>;
    update(id: string, testCase: Partial<TestCase>): Promise<TestCase | null>;
    delete(id: string): Promise<boolean>;
    deleteByProblemId(problemId: string): Promise<boolean>;
    countByProblemId(problemId: string): Promise<number>;
    
    // Add this new method for pagination
    findByProblemIdPaginated(
        problemId: string, 
        page: number, 
        limit: number, 
        isSample?: boolean
    ): Promise<PaginatedTestCases>;
}
