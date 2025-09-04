

export interface Judge0Submission {
  id: string;
  token: string;
  sourceCode: string;
  languageId: number;
  stdin?: string;
  expectedOutput?: string;
  status: Judge0Status;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  executionTime?: number;
  memoryUsage?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Judge0Status {
  id: number;
  description: string;
}

export interface Judge0Language {
  id: number;
  name: string;
  source_file: string;
  compile_cmd?: string;
}
