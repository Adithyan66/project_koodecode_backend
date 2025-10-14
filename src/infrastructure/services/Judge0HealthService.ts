

import axios from 'axios';
import { config } from '../config/config';
import { IJudge0HealthService } from '../../domain/interfaces/services/IJudge0HealthService';



export class Judge0HealthService implements IJudge0HealthService{

  async checkHealth(): Promise<{ status: string; version?: string; languages?: number }> {
  
    try {
      const headers: any = {};

      if (!config.judge0.useSelfHosted) {
        headers['X-RapidAPI-Host'] = config.judge0.rapidApiHost;
        headers['X-RapidAPI-Key'] = config.judge0.rapidApiKey;
      } else if (config.judge0.authToken) {
        headers['X-Auth-Token'] = config.judge0.authToken;
      }

      const [systemResponse, languagesResponse] = await Promise.all([
        axios.get(`${config.judge0.apiUrl}/system_info`, { headers, timeout: 5000 }).catch(() => null),
        axios.get(`${config.judge0.apiUrl}/languages`, { headers, timeout: 5000 })
      ]);

      return {
        status: 'healthy',
        version: systemResponse?.data?.version,
        languages: languagesResponse.data?.length || 0
      };
    } catch (error) {
      return {
        status: 'unhealthy'
      };
    }
  }
}
