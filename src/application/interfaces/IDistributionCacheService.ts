
export interface CachedDistribution {
  data: Array<{ value: number; percentage: number }>;
  min: number;
  max: number;
  totalCount: number;
}

export interface IDistributionCacheService {
  getDistribution(problemId: string, type: 'runtime' | 'memory'): Promise<CachedDistribution | null>;
  setDistribution(problemId: string, type: 'runtime' | 'memory', distribution: CachedDistribution): Promise<void>;
  invalidateDistribution(problemId: string): Promise<void>;
}

