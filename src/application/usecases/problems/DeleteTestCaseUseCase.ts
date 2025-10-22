import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ITestCaseRepository } from '../../../domain/interfaces/repositories/ITestCaseRepository';
import { BadRequestError, NotFoundError } from '../../errors/AppErrors';

@injectable()
export class DeleteTestCaseUseCase {
  constructor(
    @inject('IProblemRepository') private problemRepository: IProblemRepository,
    @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository
  ) {}

  async execute(slug: string, testCaseId: string, adminId: string): Promise<void> {
    try {
      // Validate admin ID
      if (!adminId || adminId.trim().length === 0) {
        throw new BadRequestError("Admin ID is required for test case deletion");
      }

      // Validate slug
      if (!slug || slug.trim().length === 0) {
        throw new BadRequestError("Problem slug is required");
      }

      // Validate test case ID
      if (!testCaseId || testCaseId.trim().length === 0) {
        throw new BadRequestError("Test case ID is required");
      }

      // Find problem by slug
      const problem = await this.problemRepository.findBySlug(slug);
      if (!problem) {
        throw new NotFoundError("Problem not found");
      }

      // Find test case by ID
      const existingTestCase = await this.testCaseRepository.findById(testCaseId);
      if (!existingTestCase) {
        throw new NotFoundError("Test case not found");
      }

      // Verify test case belongs to the problem
      if (existingTestCase.problemId !== problem.id) {
        throw new BadRequestError("Test case does not belong to the specified problem");
      }

      // Soft delete the test case
      const deleted = await this.testCaseRepository.softDelete(testCaseId);
      if (!deleted) {
        throw new BadRequestError("Failed to delete test case");
      }

    } catch (error) {
      // Re-throw application errors as-is
      if (error instanceof BadRequestError || 
          error instanceof NotFoundError) {
        throw error;
      }

      // Handle unexpected errors
      throw new BadRequestError("An unexpected error occurred while deleting the test case");
    }
  }
}
