import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { ITestCaseRepository } from '../../../../domain/interfaces/repositories/ITestCaseRepository';
import { UpdateTestCasePayload } from '../../../dto/problems/UpdateTestCaseDto';
import { BadRequestError, NotFoundError } from '../../../errors/AppErrors';
import { TestCaseValidationError } from '../../../../domain/errors/ProblemErrors';

@injectable()
export class UpdateTestCaseUseCase {
  
  constructor(
    @inject('IProblemRepository') private problemRepository: IProblemRepository,
    @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository
  ) {}

  async execute(slug: string, testCaseId: string, updateData: UpdateTestCasePayload, adminId: string): Promise<void> {
    try {
      // Validate admin ID
      if (!adminId || adminId.trim().length === 0) {
        throw new BadRequestError("Admin ID is required for test case update");
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

      // Validate update data
      this.validateUpdateData(updateData);

      // Prepare update payload (only include provided fields)
      const updatePayload: Partial<any> = {
        ...(updateData.inputs !== undefined && { inputs: updateData.inputs }),
        ...(updateData.expectedOutput !== undefined && { expectedOutput: updateData.expectedOutput }),
        ...(updateData.isSample !== undefined && { isSample: updateData.isSample }),
        updatedAt: new Date()
      };

      // Update test case
      const updatedTestCase = await this.testCaseRepository.update(testCaseId, updatePayload);
      if (!updatedTestCase) {
        throw new BadRequestError("Failed to update test case");
      }

    } catch (error) {
      // Handle domain errors - convert to application errors
      if (error instanceof TestCaseValidationError) {
        throw new BadRequestError(error.message);
      }

      // Re-throw application errors as-is
      if (error instanceof BadRequestError || 
          error instanceof NotFoundError) {
        throw error;
      }

      // Handle unexpected errors
      throw new BadRequestError("An unexpected error occurred while updating the test case");
    }
  }

  private validateUpdateData(data: UpdateTestCasePayload): void {
    // Check if at least one field is provided
    if (data.inputs === undefined && data.expectedOutput === undefined && data.isSample === undefined) {
      throw new BadRequestError("At least one field must be provided for update");
    }

    // Validate inputs if provided
    if (data.inputs !== undefined) {
      if (data.inputs === null || typeof data.inputs !== 'object' || Array.isArray(data.inputs)) {
        throw new TestCaseValidationError("Inputs must be a valid object");
      }
    }

    // Validate expectedOutput if provided
    if (data.expectedOutput !== undefined) {
      if (data.expectedOutput === null) {
        throw new TestCaseValidationError("Expected output cannot be null");
      }
    }

    // Validate isSample if provided
    if (data.isSample !== undefined) {
      if (typeof data.isSample !== 'boolean') {
        throw new TestCaseValidationError("isSample must be a boolean");
      }
    }
  }
}
