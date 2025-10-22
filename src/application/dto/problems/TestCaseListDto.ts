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
  slug: string;
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
