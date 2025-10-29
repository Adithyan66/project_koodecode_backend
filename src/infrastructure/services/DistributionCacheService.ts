import { injectable } from 'tsyringe';
import redis from '../redis/redisClient';
import { IDistributionCacheService, CachedDistribution } from '../../application/interfaces/IDistributionCacheService';

@injectable()
export class DistributionCacheService implements IDistributionCacheService {
  private readonly TTL = 300;

  private getCacheKey(problemId: string, type: 'runtime' | 'memory'): string {
    return `distribution:${problemId}:${type}`;
  }

  async getDistribution(problemId: string, type: 'runtime' | 'memory'): Promise<CachedDistribution | null> {
    try {
      const key = this.getCacheKey(problemId, type);
      const cached = await redis.get(key);
      
      if (!cached) {
        return null;
      }

      return JSON.parse(cached) as CachedDistribution;
    } catch (error) {
      console.error('Error getting cached distribution:', error);
      return null;
    }
  }

  async setDistribution(problemId: string, type: 'runtime' | 'memory', distribution: CachedDistribution): Promise<void> {
    try {
      const key = this.getCacheKey(problemId, type);
      await redis.setex(key, this.TTL, JSON.stringify(distribution));
    } catch (error) {
      console.error('Error setting cached distribution:', error);
    }
  }

  async invalidateDistribution(problemId: string): Promise<void> {
    try {
      const runtimeKey = this.getCacheKey(problemId, 'runtime');
      const memoryKey = this.getCacheKey(problemId, 'memory');
      await redis.del(runtimeKey, memoryKey);
    } catch (error) {
      console.error('Error invalidating cached distribution:', error);
    }
  }
}

