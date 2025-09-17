

export interface ExecuteCodeDto {
  userId: string;
  problemId: string;
  sourceCode: string;
  languageId: number;
  submissionType:'problem'|'contest'
}

export interface ExecuteCodeResponseDto {
  submissionId: string;
  data: any;
  status: string;
}
