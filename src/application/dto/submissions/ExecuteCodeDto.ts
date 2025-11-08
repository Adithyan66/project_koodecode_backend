

export interface ExecuteCodeDto {
  userId: string;
  problemId: string;
  sourceCode: string;
  languageId: number;
  submissionType:'problem'|'contest'|'room'
}

export interface ExecuteCodeResponseDto {
  submissionId: string;
  data: any;
  status: string;
}
