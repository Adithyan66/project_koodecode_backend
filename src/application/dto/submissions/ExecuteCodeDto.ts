

export interface ExecuteCodeDto {
  userId: string;
  problemId: string;
  sourceCode: string;
  languageId: number;
}

export interface ExecuteCodeResponseDto {
  submissionId: string;
  token: string;
  status: string;
}
