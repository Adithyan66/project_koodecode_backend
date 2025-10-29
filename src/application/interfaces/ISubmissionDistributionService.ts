import { RuntimeDistribution, MemoryDistribution } from '../dto/submissions/SubmissionResponseDto';

export interface ISubmissionDistributionService {
  calculateRuntimeDistribution(problemId: string, userRuntime: number): Promise<RuntimeDistribution | null>;
  calculateMemoryDistribution(problemId: string, userMemory: number): Promise<MemoryDistribution | null>;
}

