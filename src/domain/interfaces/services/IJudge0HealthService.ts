

export interface IJudge0HealthService {
    
    checkHealth(): Promise<{ status: string; version?: string; languages?: number }>;
}
