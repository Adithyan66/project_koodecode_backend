
import { Judge0Language } from '../../entities/Judge0Submission';

export interface Judge0SubmissionRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
  wall_time_limit?: number;
  enable_per_process_and_thread_time_limit?: boolean;
  enable_per_process_and_thread_memory_limit?: boolean;
  max_processes_and_or_threads?: number;
}

export interface Judge0SubmissionResponse {
  status_id: number;
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: string;
  memory?: number;
  message?: string;
}

export interface IJudge0Service {
  
  submitCode(request: Judge0SubmissionRequest): Promise<Judge0SubmissionResponse>;
  getSubmissionResult(token: string): Promise<Judge0SubmissionResponse>;
  getLanguages(): Promise<Judge0Language[]>;
  batchSubmissions(requests: Judge0SubmissionRequest[]): Promise<Judge0SubmissionResponse[]>;
}
