



import { Problem, Constraint } from '../../../domain/entities/Problem';
import { TestCase } from '../../../domain/entities/TestCase';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ITestCaseRepository } from '../../../domain/interfaces/repositories/ITestCaseRepository';
import { ICounterRepository } from '../../../domain/interfaces/repositories/ICounterRepository';
import { CreateProblemDto } from '../../dto/problems/CreateProblemDto';
import { inject, injectable } from 'tsyringe';

// Domain Value Objects
import { ProgrammingLanguage } from '../../../domain/value-objects/ProgrammingLanguage';

// Domain Errors
import { 
  ProblemAlreadyExistsError, 
  InvalidProblemDataError, 
  TestCaseValidationError,
  ProblemParameterError,
  ProblemTemplateError,
  ProblemCreationError
} from '../../../domain/errors/ProblemErrors';

// Application Errors
import { 
  BadRequestError, 
  ConflictError, 
  NotFoundError 
} from '../../errors/AppErrors';
import { ICreateProblemUseCase } from '../../interfaces/IProblemUseCase';

@injectable()
export class CreateProblemUseCase implements ICreateProblemUseCase {

  constructor(
    @inject('IProblemRepository') private problemRepository: IProblemRepository,
    @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository,
    @inject('ICounterRepository') private counterRepository: ICounterRepository
  ) { }

  async execute(data: CreateProblemDto, adminId: string): Promise<Problem> {
    try {
      // Validate admin ID
      if (!adminId || adminId.trim().length === 0) {
        throw new BadRequestError("Admin ID is required for problem creation");
      }

      // Validate basic problem data
      this.validateProblemData(data);

      // Generate and validate slug
      const slug = this.generateSlug(data.title);
      if (!slug || slug.length === 0) {
        throw new InvalidProblemDataError("title", "Cannot generate valid slug from title");
      }

      // Check for existing problem
      const existingProblem = await this.problemRepository.findBySlug(slug);
      if (existingProblem) {
        throw new ProblemAlreadyExistsError(data.title);
      }

      // Validate test cases
      this.validateTestCases(data.testCases);

      // Validate parameters
      this.validateParameters(data.parameters);

      // Validate constraints
      this.validateConstraints(data.constraints);

      // Validate templates
      this.validateTemplates(data.templates, data.supportedLanguages);

      // Get next problem number
      const problemNumber = await this.getNextProblemNumber();

      // Transform data according to entity structure
      const transformedExamples = this.transformExamples(data.examples);
      const transformedConstraints = this.transformConstraints(data.constraints);
      const transformedParameters = this.transformParameters(data.parameters);
      const transformedTemplates = this.transformTemplates(data.templates);

      // Create problem entity
      const problem = new Problem({
        problemNumber,
        title: data.title,
        slug,
        difficulty: data.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
        tags: data.tags,
        description: data.description,
        constraints: transformedConstraints,
        examples: transformedExamples,
        likes: [],
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        hints: data.hints || [],
        companies: data.companies || [],
        isActive: data.isActive,
        createdBy: adminId,
        functionName: data.functionName,
        returnType: data.returnType,
        parameters: transformedParameters,
        supportedLanguages: data.supportedLanguages,
        templates: transformedTemplates
      });

      // Save problem
      const savedProblem = await this.saveProblem(problem);

      // Create test cases
      await this.createTestCases(data.testCases, savedProblem.id!);

      return savedProblem;

    } catch (error) {
      // Handle domain errors - convert to application errors
      if (error instanceof ProblemAlreadyExistsError) {
        throw new ConflictError(error.message);
      }
      
      if (error instanceof InvalidProblemDataError || 
          error instanceof TestCaseValidationError ||
          error instanceof ProblemParameterError ||
          error instanceof ProblemTemplateError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof ProblemCreationError) {
        throw new BadRequestError(error.message);
      }

      // Re-throw application errors as-is
      if (error instanceof BadRequestError || 
          error instanceof ConflictError || 
          error instanceof NotFoundError) {
        throw error;
      }

      // Handle unexpected errors
      console.error('Unexpected error in CreateProblemUseCase:', error);
      throw new BadRequestError("An unexpected error occurred while creating the problem");
    }
  }

  // ✅ Updated validation using ProgrammingLanguage value object
  private validateProblemData(data: CreateProblemDto): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new InvalidProblemDataError("title", "Title is required and cannot be empty");
    }

    if (data.title.length > 200) {
      throw new InvalidProblemDataError("title", "Title cannot exceed 200 characters");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new InvalidProblemDataError("description", "Description is required and cannot be empty");
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!data.difficulty || !validDifficulties.includes(data.difficulty.toLowerCase())) {
      throw new InvalidProblemDataError("difficulty", "Difficulty must be Easy, Medium, or Hard");
    }

    if (!data.functionName || data.functionName.trim().length === 0) {
      throw new InvalidProblemDataError("functionName", "Function name is required");
    }

    if (!data.returnType || data.returnType.trim().length === 0) {
      throw new InvalidProblemDataError("returnType", "Return type is required");
    }

    if (!data.supportedLanguages || data.supportedLanguages.length === 0) {
      throw new InvalidProblemDataError("supportedLanguages", "At least one supported language ID is required");
    }

    // ✅ Use domain value object for language validation
    data.supportedLanguages.forEach(languageId => {
      if (!ProgrammingLanguage.isSupported(languageId)) {
        const supportedIds = Object.keys(ProgrammingLanguage.getAllSupportedLanguages()).join(', ');
        throw new InvalidProblemDataError(
          "supportedLanguages", 
          `Unsupported language ID: ${languageId}. Supported IDs: ${supportedIds}`
        );
      }
    });
  }

  private validateConstraints(constraints: any[]): void {
    if (!constraints || !Array.isArray(constraints)) {
      throw new InvalidProblemDataError("constraints", "Constraints must be an array");
    }

    constraints.forEach((constraint, index) => {
      if (!constraint.parameterName || constraint.parameterName.trim().length === 0) {
        throw new InvalidProblemDataError("constraints", `Constraint ${index + 1}: parameterName is required`);
      }

      if (!constraint.type || constraint.type.trim().length === 0) {
        throw new InvalidProblemDataError("constraints", `Constraint ${index + 1}: type is required`);
      }

      // Validate numeric constraints
      if (constraint.minLength !== undefined && (typeof constraint.minLength !== 'number' || constraint.minLength < 0)) {
        throw new InvalidProblemDataError("constraints", `Constraint ${index + 1}: minLength must be a non-negative number`);
      }

      if (constraint.maxLength !== undefined && (typeof constraint.maxLength !== 'number' || constraint.maxLength < 0)) {
        throw new InvalidProblemDataError("constraints", `Constraint ${index + 1}: maxLength must be a non-negative number`);
      }

      if (constraint.minValue !== undefined && typeof constraint.minValue !== 'number') {
        throw new InvalidProblemDataError("constraints", `Constraint ${index + 1}: minValue must be a number`);
      }

      if (constraint.maxValue !== undefined && typeof constraint.maxValue !== 'number') {
        throw new InvalidProblemDataError("constraints", `Constraint ${index + 1}: maxValue must be a number`);
      }

      // Validate min/max relationships
      if (constraint.minLength !== undefined && constraint.maxLength !== undefined && constraint.minLength > constraint.maxLength) {
        throw new InvalidProblemDataError("constraints", `Constraint ${index + 1}: minLength cannot be greater than maxLength`);
      }

      if (constraint.minValue !== undefined && constraint.maxValue !== undefined && constraint.minValue > constraint.maxValue) {
        throw new InvalidProblemDataError("constraints", `Constraint ${index + 1}: minValue cannot be greater than maxValue`);
      }
    });
  }

  private validateTestCases(testCases: any[]): void {
    if (!testCases || testCases.length === 0) {
      throw new TestCaseValidationError("At least one test case is required");
    }

    const sampleTestCases = testCases.filter(tc => tc.isSample);
    if (sampleTestCases.length === 0) {
      throw new TestCaseValidationError("At least one sample test case is required");
    }

    testCases.forEach((testCase, index) => {
      if (!testCase.inputs || typeof testCase.inputs !== 'object') {
        throw new TestCaseValidationError(`Test case ${index + 1}: inputs must be a valid object`);
      }

      if (testCase.expectedOutput === undefined || testCase.expectedOutput === null) {
        throw new TestCaseValidationError(`Test case ${index + 1}: expectedOutput is required`);
      }

      if (typeof testCase.isSample !== 'boolean') {
        throw new TestCaseValidationError(`Test case ${index + 1}: isSample must be a boolean`);
      }
    });
  }

  private validateParameters(parameters: any[]): void {
    if (!parameters || parameters.length === 0) {
      throw new ProblemParameterError("parameters", "At least one parameter is required");
    }

    parameters.forEach((param, index) => {
      if (!param.name || param.name.trim().length === 0) {
        throw new ProblemParameterError(`parameter ${index + 1}`, "Parameter name is required");
      }

      if (!param.type || param.type.trim().length === 0) {
        throw new ProblemParameterError(`parameter ${index + 1}`, "Parameter type is required");
      }
    });
  }

  // ✅ Updated template validation using ProgrammingLanguage value object
  private validateTemplates(templates: any, supportedLanguageIds: number[]): void {
    if (!templates || typeof templates !== 'object') {
      throw new ProblemTemplateError("templates", "Templates object is required");
    }

    supportedLanguageIds.forEach(languageId => {
      // Validate language is supported first
      if (!ProgrammingLanguage.isSupported(languageId)) {
        throw new ProblemTemplateError(
          `Language ID ${languageId}`, 
          "Unsupported programming language"
        );
      }

      const languageKey = languageId.toString();
      const languageInfo = ProgrammingLanguage.getLanguageInfo(languageId);
      const languageName = languageInfo?.name || `Language ID ${languageId}`;
      
      if (!templates[languageKey]) {
        throw new ProblemTemplateError(
          languageName, 
          `Template is required for supported language (ID: ${languageId})`
        );
      }

      const template = templates[languageKey];
      
      // Validate template structure according to entity
      if (!template.templateCode || template.templateCode.trim().length === 0) {
        throw new ProblemTemplateError(languageName, "templateCode is required and cannot be empty");
      }

      if (!template.userFunctionSignature || template.userFunctionSignature.trim().length === 0) {
        throw new ProblemTemplateError(languageName, "userFunctionSignature is required and cannot be empty");
      }

      if (!template.placeholder || template.placeholder.trim().length === 0) {
        throw new ProblemTemplateError(languageName, "placeholder is required and cannot be empty");
      }
    });
  }

  // Transform methods to match entity structure
  private transformExamples(examples: any[]): Array<{
    input: string;
    output: string;
    explanation: string;
    isSample?: boolean;
  }> {
    try {
      return examples.map(example => ({
        input: typeof example.inputs === 'string' ? example.inputs : JSON.stringify(example.inputs),
        output: typeof example.expectedOutput === 'string' ? example.expectedOutput : JSON.stringify(example.expectedOutput),
        explanation: example.explanation || '',
        isSample: true // All examples are sample by default
      }));
    } catch (error) {
      throw new InvalidProblemDataError("examples", "Failed to transform examples data");
    }
  }

  private transformConstraints(constraints: any[]): Constraint[] {
    try {
      return constraints.map(constraint => ({
        parameterName: constraint.parameterName,
        type: constraint.type,
        minLength: constraint.minLength,
        maxLength: constraint.maxLength,
        minValue: constraint.minValue,
        maxValue: constraint.maxValue
      }));
    } catch (error) {
      throw new InvalidProblemDataError("constraints", "Failed to transform constraints data");
    }
  }

  private transformParameters(parameters: any[]): Array<{
    name: string;
    type: string;
    description?: string;
  }> {
    try {
      return parameters.map(param => ({
        name: param.name,
        type: param.type,
        description: param.description
      }));
    } catch (error) {
      throw new InvalidProblemDataError("parameters", "Failed to transform parameters data");
    }
  }

  private transformTemplates(templates: any): Record<string, {
    templateCode: string;
    userFunctionSignature: string;
    placeholder: string;
  }> {
    try {
      const transformedTemplates: Record<string, {
        templateCode: string;
        userFunctionSignature: string;
        placeholder: string;
      }> = {};

      Object.keys(templates).forEach(languageId => {
        transformedTemplates[languageId] = {
          templateCode: templates[languageId].templateCode,
          userFunctionSignature: templates[languageId].userFunctionSignature,
          placeholder: templates[languageId].placeholder
        };
      });

      return transformedTemplates;
    } catch (error) {
      throw new InvalidProblemDataError("templates", "Failed to transform templates data");
    }
  }

  private async getNextProblemNumber(): Promise<number> {
    try {
      return await this.counterRepository.getNextSequenceValue('problemNumber');
    } catch (error) {
      console.error('Error getting next problem number:', error);
      throw new ProblemCreationError("Failed to generate problem number");
    }
  }

  private async saveProblem(problem: Problem): Promise<Problem> {
    try {
      const savedProblem = await this.problemRepository.create(problem);
      if (!savedProblem || !savedProblem.id) {
        throw new ProblemCreationError("Failed to save problem to database");
      }
      return savedProblem;
    } catch (error) {
      if (error instanceof ProblemCreationError) {
        throw error;
      }
      console.error('Database error while saving problem:', error);
      throw new ProblemCreationError("Database error occurred while saving problem");
    }
  }

  private async createTestCases(testCasesData: any[], problemId: string): Promise<void> {
    try {
      const testCases = testCasesData.map(tc =>
        TestCase.createTestCase(
          problemId,
          tc.inputs,
          tc.expectedOutput,
          tc.isSample,
        )
      );

      await this.testCaseRepository.createMany(testCases);
    } catch (error) {
      console.error('Error creating test cases:', error);
      throw new ProblemCreationError("Failed to create test cases for the problem");
    }
  }

  private generateSlug(title: string): string {
    if (!title || title.trim().length === 0) {
      throw new InvalidProblemDataError("title", "Title cannot be empty for slug generation");
    }

    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
}
