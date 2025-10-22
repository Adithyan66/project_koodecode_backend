import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ITestCaseRepository } from '../../../domain/interfaces/repositories/ITestCaseRepository';
import { BadRequestError, NotFoundError } from '../../errors/AppErrors';

@injectable()
export class DeleteProblemUseCase {
  constructor(
    @inject('IProblemRepository') private problemRepository: IProblemRepository,
    @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository
  ) {}

  async execute(slug: string, adminId: string): Promise<void> {
    try {
      // Validate admin ID
      if (!adminId || adminId.trim().length === 0) {
        throw new BadRequestError("Admin ID is required for problem deletion");
      }

      // Validate slug
      if (!slug || slug.trim().length === 0) {
        throw new BadRequestError("Problem slug is required");
      }

      // Find problem by slug
      const problem = await this.problemRepository.findBySlug(slug);
      if (!problem) {
        throw new NotFoundError("Problem not found");
      }

      // Soft delete the problem
      const deleted = await this.problemRepository.softDeleteBySlug(slug);
      if (!deleted) {
        throw new BadRequestError("Failed to delete problem");
      }

      // Soft delete all associated test cases
      await this.testCaseRepository.softDeleteByProblemId(problem.id!);

    } catch (error) {
      // Re-throw application errors as-is
      if (error instanceof BadRequestError || 
          error instanceof NotFoundError) {
        throw error;
      }

      // Handle unexpected errors
      throw new BadRequestError("An unexpected error occurred while deleting the problem");
    }
  }
}
