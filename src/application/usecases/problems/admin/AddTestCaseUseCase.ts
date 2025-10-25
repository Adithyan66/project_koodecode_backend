import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { ITestCaseRepository } from '../../../../domain/interfaces/repositories/ITestCaseRepository';
import { AddTestCasePayload } from '../../../dto/problems/AddTestCaseDto';
import { TestCase } from '../../../../domain/entities/TestCase';
import { BadRequestError, NotFoundError, ConflictError } from '../../../errors/AppErrors';
import { TestCaseValidationError } from '../../../../domain/errors/ProblemErrors';

@injectable()
export class AddTestCaseUseCase {

  constructor(
    @inject('IProblemRepository') private problemRepository: IProblemRepository,
    @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository
  ) {}

  async execute(slug: string, testCaseData: AddTestCasePayload, adminId: string): Promise<void> {

    try {
      if (!adminId || adminId.trim().length === 0) {
        throw new BadRequestError("Admin ID is required for test case creation");
      }

      if (!slug || slug.trim().length === 0) {
        throw new BadRequestError("Problem slug is required");
      }

      const problem = await this.problemRepository.findBySlug(slug);
      if (!problem) {
        throw new NotFoundError("Problem not found");
      }

      this.validateTestCaseData(testCaseData);
      
      
      // Validate inputs against problem parameters
      this.validateInputsAgainstParameters(testCaseData.inputs, problem.parameters);
      
      // Validate expected output type
      this.validateExpectedOutputType(testCaseData.expectedOutput, problem.returnType);
      
      // Check for duplicate test case
      await this.checkForDuplicateTestCase(problem.id!, testCaseData);
      
      // Create test case entity
      const testCase = TestCase.createTestCase(
        problem.id!,
        testCaseData.inputs,
        testCaseData.expectedOutput,
        testCaseData.isSample
      );
      
      // Save test case
      await this.testCaseRepository.create(testCase);
      
      console.log("passssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss");
    } catch (error) {
      // Handle domain errors - convert to application errors
      if (error instanceof TestCaseValidationError) {
        throw new BadRequestError(error.message);
      }

      // Re-throw application errors as-is
      if (error instanceof BadRequestError || 
          error instanceof NotFoundError ||
          error instanceof ConflictError) {
        throw error;
      }

      // Handle unexpected errors
      throw new BadRequestError("An unexpected error occurred while creating the test case");
    }
  }

  private validateTestCaseData(data: AddTestCasePayload): void {
    if (!data.inputs || typeof data.inputs !== 'object' || Array.isArray(data.inputs)) {
      throw new TestCaseValidationError("Inputs must be a valid object");
    }

    if (data.expectedOutput === undefined || data.expectedOutput === null) {
      throw new TestCaseValidationError("Expected output is required");
    }

    if (typeof data.isSample !== 'boolean') {
      throw new TestCaseValidationError("isSample must be a boolean");
    }
  }

  private validateInputsAgainstParameters(inputs: Record<string, any>, parameters: any[]): void {
    // Check if all required parameters are present
    for (const param of parameters) {
      if (!(param.name in inputs)) {
        throw new TestCaseValidationError(`Missing required parameter: ${param.name}`);
      }
    }

    // Check if there are any extra parameters not defined in the problem
    const parameterNames = parameters.map(p => p.name);
    const inputKeys = Object.keys(inputs);
    const extraKeys = inputKeys.filter(key => !parameterNames.includes(key));
    
    if (extraKeys.length > 0) {
      throw new TestCaseValidationError(`Unexpected parameters: ${extraKeys.join(', ')}`);
    }

    // Validate parameter types
    for (const param of parameters) {
      const value = inputs[param.name];
      this.validateParameterType(value, param.type, param.name);
    }
  }

  private validateParameterType(value: any, expectedType: string, paramName: string): void {
    switch (expectedType.toLowerCase()) {
      case 'number':
        if (typeof value !== 'number') {
          throw new TestCaseValidationError(`Parameter '${paramName}' must be a number`);
        }
        break;
      case 'string':
        if (typeof value !== 'string') {
          throw new TestCaseValidationError(`Parameter '${paramName}' must be a string`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new TestCaseValidationError(`Parameter '${paramName}' must be a boolean`);
        }
        break;
      case 'number[]':
        if (!Array.isArray(value) || !value.every(v => typeof v === 'number')) {
          throw new TestCaseValidationError(`Parameter '${paramName}' must be an array of numbers`);
        }
        break;
      case 'string[]':
        if (!Array.isArray(value) || !value.every(v => typeof v === 'string')) {
          throw new TestCaseValidationError(`Parameter '${paramName}' must be an array of strings`);
        }
        break;
      default:
        // For other types, just check if value is not null/undefined
        if (value === null || value === undefined) {
          throw new TestCaseValidationError(`Parameter '${paramName}' cannot be null or undefined`);
        }
    }
  }

  private validateExpectedOutputType(expectedOutput: any, returnType: string): void {
    switch (returnType.toLowerCase()) {
      case 'number':
        if (typeof expectedOutput !== 'number') {
          throw new TestCaseValidationError(`Expected output must be a number (return type: ${returnType})`);
        }
        break;
      case 'string':
        if (typeof expectedOutput !== 'string') {
          throw new TestCaseValidationError(`Expected output must be a string (return type: ${returnType})`);
        }
        break;
      case 'boolean':
        if (typeof expectedOutput !== 'boolean') {
          throw new TestCaseValidationError(`Expected output must be a boolean (return type: ${returnType})`);
        }
        break;
      case 'number[]':
        if (!Array.isArray(expectedOutput) || !expectedOutput.every(v => typeof v === 'number')) {
          throw new TestCaseValidationError(`Expected output must be an array of numbers (return type: ${returnType})`);
        }
        break;
      case 'string[]':
        if (!Array.isArray(expectedOutput) || !expectedOutput.every(v => typeof v === 'string')) {
          throw new TestCaseValidationError(`Expected output must be an array of strings (return type: ${returnType})`);
        }
        break;
      default:
        // For other types, just check if value is not null/undefined
        if (expectedOutput === null || expectedOutput === undefined) {
          throw new TestCaseValidationError(`Expected output cannot be null or undefined (return type: ${returnType})`);
        }
    }
  }

  private async checkForDuplicateTestCase(problemId: string, testCaseData: AddTestCasePayload): Promise<void> {
    const existingTestCases = await this.testCaseRepository.findByProblemId(problemId);
    
    const isDuplicate = existingTestCases.some(tc => 
      JSON.stringify(tc.inputs) === JSON.stringify(testCaseData.inputs) &&
      JSON.stringify(tc.expectedOutput) === JSON.stringify(testCaseData.expectedOutput)
    );

    if (isDuplicate) {
      throw new ConflictError("A test case with the same inputs and expected output already exists");
    }
  }
}
