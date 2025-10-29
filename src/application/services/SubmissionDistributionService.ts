import { inject, injectable } from 'tsyringe';
import { ISubmissionDistributionService } from '../interfaces/ISubmissionDistributionService';
import { RuntimeDistribution, MemoryDistribution, DistributionDataPoint } from '../dto/submissions/SubmissionResponseDto';
import { ISubmissionRepository } from '../../domain/interfaces/repositories/ISubmissionRepository';
import { IDistributionCacheService, CachedDistribution } from '../interfaces/IDistributionCacheService';

@injectable()
export class SubmissionDistributionService implements ISubmissionDistributionService {
  private readonly BUCKET_COUNT = 8;
  private readonly MIN_SUBMISSIONS = 10;

  constructor(
    @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository,
    @inject('IDistributionCacheService') private cacheService: IDistributionCacheService
  ) {}

  async calculateRuntimeDistribution(problemId: string, userRuntime: number): Promise<RuntimeDistribution | null> {
    try {
      const cached = await this.cacheService.getDistribution(problemId, 'runtime');
      
      let distribution: CachedDistribution;
      
      if (cached) {
        distribution = cached;
      } else {
        const submissions = await this.submissionRepository.findAcceptedByProblemId(problemId);
        
        if (submissions.length < this.MIN_SUBMISSIONS) {
          return null;
        }

        const runtimes = submissions.map(s => s.totalExecutionTime).filter(t => t > 0);
        
        if (runtimes.length < this.MIN_SUBMISSIONS) {
          return null;
        }

        distribution = this.calculateDistribution(runtimes);
        await this.cacheService.setDistribution(problemId, 'runtime', distribution);
      }

      const beats = this.calculateBeatsPercentage(distribution, userRuntime);
      
      const data: DistributionDataPoint[] = distribution.data.map(d => ({
        runtime: d.value,
        percentage: d.percentage
      }));

      return {
        data,
        userRuntime,
        beats
      };
    } catch (error) {
      console.error('Error calculating runtime distribution:', error);
      return null;
    }
  }

  async calculateMemoryDistribution(problemId: string, userMemory: number): Promise<MemoryDistribution | null> {
    try {
      const cached = await this.cacheService.getDistribution(problemId, 'memory');
      
      let distribution: CachedDistribution;
      
      if (cached) {
        distribution = cached;
      } else {
        const submissions = await this.submissionRepository.findAcceptedByProblemId(problemId);
        
        if (submissions.length < this.MIN_SUBMISSIONS) {
          return null;
        }

        const memories = submissions.map(s => s.maxMemoryUsage).filter(m => m > 0);
        
        if (memories.length < this.MIN_SUBMISSIONS) {
          return null;
        }

        distribution = this.calculateDistribution(memories);
        await this.cacheService.setDistribution(problemId, 'memory', distribution);
      }

      const beats = this.calculateBeatsPercentage(distribution, userMemory);
      
      const data: DistributionDataPoint[] = distribution.data.map(d => ({
        memory: d.value,
        percentage: d.percentage
      }));

      return {
        data,
        userMemory,
        beats
      };
    } catch (error) {
      console.error('Error calculating memory distribution:', error);
      return null;
    }
  }

  private calculateDistribution(values: number[]): CachedDistribution {
    const sortedValues = [...values].sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const range = max - min;
    const bucketWidth = range / this.BUCKET_COUNT;

    const buckets = new Array(this.BUCKET_COUNT).fill(0);
    const bucketValues = new Array(this.BUCKET_COUNT).fill(0);

    for (let i = 0; i < this.BUCKET_COUNT; i++) {
      bucketValues[i] = min + bucketWidth * (i + 0.5);
    }

    for (const value of sortedValues) {
      let bucketIndex = Math.floor((value - min) / bucketWidth);
      if (bucketIndex >= this.BUCKET_COUNT) {
        bucketIndex = this.BUCKET_COUNT - 1;
      }
      buckets[bucketIndex]++;
    }

    const totalCount = sortedValues.length;
    const data = buckets.map((count, index) => ({
      value: Math.round(bucketValues[index] * 100) / 100,
      percentage: Math.round((count / totalCount) * 100 * 100) / 100
    }));

    return {
      data,
      min,
      max,
      totalCount
    };
  }

  private calculateBeatsPercentage(distribution: CachedDistribution, userValue: number): number {
    const { data, min, max, totalCount } = distribution;
    
    if (userValue <= min) {
      return 100;
    }
    
    if (userValue >= max) {
      return 0;
    }

    const range = max - min;
    const bucketWidth = range / this.BUCKET_COUNT;
    
    let submissionsBetter = 0;
    
    for (let i = 0; i < data.length; i++) {
      const bucketMin = min + bucketWidth * i;
      const bucketMax = min + bucketWidth * (i + 1);
      const bucketCount = Math.round((data[i].percentage / 100) * totalCount);
      
      if (bucketMax <= userValue) {
        submissionsBetter += bucketCount;
      } else if (bucketMin < userValue && bucketMax > userValue) {
        const portionBetter = (userValue - bucketMin) / bucketWidth;
        submissionsBetter += Math.round(bucketCount * portionBetter);
      }
    }

    const beatsPercentage = (submissionsBetter / totalCount) * 100;
    return Math.round(beatsPercentage * 100) / 100;
  }
}

