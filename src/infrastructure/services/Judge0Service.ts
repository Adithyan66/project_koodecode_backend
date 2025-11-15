

import axios, { AxiosError, AxiosInstance } from 'axios';
import { ICodeExecutionService, Judge0SubmissionRequest, Judge0SubmissionResponse } from '../../domain/interfaces/services/IJudge0Service';
import { Judge0Language } from '../../domain/entities/Judge0Submission';
import { config } from '../config/config';

export class Judge0Service implements ICodeExecutionService {
  private httpClient: AxiosInstance;

  constructor() {

    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (!config.judge0.useSelfHosted) {
      headers['X-RapidAPI-Host'] = config.judge0.rapidApiHost;
      headers['X-RapidAPI-Key'] = config.judge0.rapidApiKey;
    } else if (config.judge0.authToken) {
      headers['X-Auth-Token'] = config.judge0.authToken;
    }    

    this.httpClient = axios.create({
      baseURL: config.judge0.apiUrl,
      headers,
      timeout: 30000
    });
  }

  async submitCode(request: Judge0SubmissionRequest): Promise<Judge0SubmissionResponse> {

    try {
      const response = await this.httpClient.post('/submissions', {
        ...request,
        wait: false,
        base64_encoded: false
      });      

      return response.data;

    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Judge0 submission error:', error.response?.data || error.message);
        throw new Error(`Failed to submit code: ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`Failed to submit code`);

    }
  }

  async getSubmissionResult(token: string): Promise<Judge0SubmissionResponse> {
    try {
      const response = await this.httpClient.get(`/submissions/${token}`, {
        params: {
          base64_encoded: false,
        //   fields: '*'
        }
      });
      
      
      return response.data;

    } catch (error) {

      if (error instanceof AxiosError) {
        console.error('Judge0 get result error:', error.response?.data || error.message);
        throw new Error(`Failed to get submission result: ${error.response?.data?.message || error.message}`);
      }

      throw new Error(`Failed to get submission result`);
    }
  }

  async getLanguages(): Promise<Judge0Language[]> {
    try {
      const response = await this.httpClient.get('/languages');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Judge0 get languages error:', error.response?.data || error.message);
        throw new Error(`Failed to get languages: ${error.response?.data?.message || error.message}`);
      }
    }
    throw new Error(`Failed to get languages`);
  }

  async batchSubmissions(requests: Judge0SubmissionRequest[]): Promise<Judge0SubmissionResponse[]> {
    try {
      const response = await this.httpClient.post('/submissions/batch', {
        submissions: requests.map(req => ({ ...req, wait: false, base64_encoded: false }))
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Judge0 batch submission error:', error.response?.data || error.message);
        throw new Error(`Failed to submit batch: ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`Failed to submit batch`);

    }
  }
}
