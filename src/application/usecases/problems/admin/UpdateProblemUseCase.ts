import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { UpdateProblemPayload } from '../../../dto/problems/UpdateProblemDto';
import { Problem } from '../../../../domain/entities/Problem';
import { BadRequestError, NotFoundError, ConflictError } from '../../../errors/AppErrors';
import { 
  InvalidProblemDataError, 
  ProblemAlreadyExistsError,
  TestCaseValidationError,
  ProblemParameterError,
  ProblemTemplateError
} from '../../../../domain/errors/ProblemErrors';
import { AdminProblemDetailResponse, UserDTO, SubmissionStats } from '../../../dto/problems/AdminProblem';

@injectable()
export class UpdateProblemUseCase {
  constructor(
    @inject('IProblemRepository') private problemRepository: IProblemRepository,
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async execute(slug: string, updateData: UpdateProblemPayload, adminId: string): Promise<AdminProblemDetailResponse> {
    try {
      // Validate admin ID
      if (!adminId || adminId.trim().length === 0) {
        throw new BadRequestError("Admin ID is required for problem update");
      }

      // Find existing problem by slug
      const existingProblem = await this.problemRepository.findBySlug(slug);
      if (!existingProblem) {
        throw new NotFoundError("Problem not found");
      }

      // Validate update data
      this.validateUpdateData(updateData);

      // Handle slug update if title is being updated
      let newSlug = existingProblem.slug;
      if (updateData.title && updateData.title !== existingProblem.title) {
        newSlug = this.generateSlug(updateData.title);
        
        // Check if new slug already exists (excluding current problem)
        const existingWithNewSlug = await this.problemRepository.findBySlug(newSlug);
        if (existingWithNewSlug && existingWithNewSlug.id !== existingProblem.id) {
          throw new ConflictError("A problem with this title already exists");
        }
      }

      // Validate parameters if provided
      if (updateData.parameters) {
        this.validateParameters(updateData.parameters);
      }

      // Validate constraints if provided
      if (updateData.constraints) {
        this.validateConstraints(updateData.constraints);
      }

      // Validate templates if provided
      if (updateData.templates && updateData.supportedLanguages) {
        this.validateTemplates(updateData.templates, updateData.supportedLanguages);
      }

      // Transform data according to entity structure
      const transformedExamples = updateData.examples ? this.transformExamples(updateData.examples) : undefined;
      const transformedConstraints = updateData.constraints ? this.transformConstraints(updateData.constraints) : undefined;
      const transformedParameters = updateData.parameters ? this.transformParameters(updateData.parameters) : undefined;
      const transformedTemplates = updateData.templates ? this.transformTemplates(updateData.templates) : undefined;

      // Prepare update data
      const updatePayload: Partial<Problem> = {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.difficulty && { difficulty: updateData.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard' }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        ...(updateData.functionName && { functionName: updateData.functionName }),
        ...(updateData.returnType && { returnType: updateData.returnType }),
        ...(updateData.tags && { tags: updateData.tags }),
        ...(updateData.hints && { hints: updateData.hints }),
        ...(updateData.companies && { companies: updateData.companies }),
        ...(updateData.supportedLanguages && { supportedLanguages: updateData.supportedLanguages }),
        ...(transformedConstraints && { constraints: transformedConstraints }),
        ...(transformedExamples && { examples: transformedExamples }),
        ...(transformedParameters && { parameters: transformedParameters }),
        ...(transformedTemplates && { templates: transformedTemplates }),
        ...(newSlug !== existingProblem.slug && { slug: newSlug }),
        updatedAt: new Date()
      };

      // Update problem
      const updatedProblem = await this.problemRepository.update(existingProblem.id!, updatePayload);
      if (!updatedProblem) {
        throw new BadRequestError("Failed to update problem");
      }

      // Get creator information
      const creator = await this.userRepository.findById(updatedProblem.createdBy);
      if (!creator) {
        throw new BadRequestError("Problem creator not found");
      }

      // Get submission stats
      const submissionStats = await this.problemRepository.getSubmissionStatsByProblemId(updatedProblem.id!);

      // Create response
      const creatorDTO: UserDTO = {
        fullName: creator.fullName,
        email: creator.email,
        userName: creator.userName,
        role: creator.role
      };

      const submissionStatsDTO: SubmissionStats = {
        totalSubmissions: submissionStats.totalSubmissions,
        acceptedSubmissions: submissionStats.acceptedSubmissions,
        acceptanceRate: submissionStats.totalSubmissions > 0 
          ? Math.round((submissionStats.acceptedSubmissions / submissionStats.totalSubmissions) * 100)
          : 0
      };

      return new AdminProblemDetailResponse(
        updatedProblem.problemNumber,
        updatedProblem.title,
        updatedProblem.slug,
        updatedProblem.difficulty,
        updatedProblem.tags,
        updatedProblem.description,
        updatedProblem.constraints,
        updatedProblem.examples,
        updatedProblem.hints,
        updatedProblem.companies,
        updatedProblem.isActive,
        updatedProblem.functionName,
        updatedProblem.returnType,
        updatedProblem.parameters,
        updatedProblem.supportedLanguages,
        updatedProblem.templates,
        creatorDTO,
        submissionStatsDTO
      );

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

      // Re-throw application errors as-is
      if (error instanceof BadRequestError || 
          error instanceof ConflictError || 
          error instanceof NotFoundError) {
        throw error;
      }

      // Handle unexpected errors
      throw new BadRequestError("An unexpected error occurred while updating the problem");
    }
  }

  private validateUpdateData(data: UpdateProblemPayload): void {
    if (data.title !== undefined && (!data.title || data.title.trim().length === 0)) {
      throw new InvalidProblemDataError("title", "Title cannot be empty");
    }

    if (data.description !== undefined && (!data.description || data.description.trim().length === 0)) {
      throw new InvalidProblemDataError("description", "Description cannot be empty");
    }

    if (data.difficulty !== undefined && !['easy', 'medium', 'hard'].includes(data.difficulty.toLowerCase())) {
      throw new InvalidProblemDataError("difficulty", "Difficulty must be easy, medium, or hard");
    }

    if (data.functionName !== undefined && (!data.functionName || data.functionName.trim().length === 0)) {
      throw new InvalidProblemDataError("functionName", "Function name cannot be empty");
    }

    if (data.returnType !== undefined && (!data.returnType || data.returnType.trim().length === 0)) {
      throw new InvalidProblemDataError("returnType", "Return type cannot be empty");
    }
  }

  private validateParameters(parameters: any[]): void {
    if (!Array.isArray(parameters)) {
      throw new ProblemParameterError("parameters", "Parameters must be an array");
    }

    for (const param of parameters) {
      if (!param.name || !param.type) {
        throw new ProblemParameterError(param.name || "unknown", "Each parameter must have a name and type");
      }
    }
  }

  private validateConstraints(constraints: any[]): void {
    if (!Array.isArray(constraints)) {
      throw new InvalidProblemDataError("constraints", "Constraints must be an array");
    }

    for (const constraint of constraints) {
      if (!constraint.parameterName || !constraint.type) {
        throw new InvalidProblemDataError("constraints", "Each constraint must have parameterName and type");
      }
    }
  }

  private validateTemplates(templates: Record<number, any>, supportedLanguages: number[]): void {
    for (const languageId of supportedLanguages) {
      const template = templates[languageId];
      if (!template) {
        throw new ProblemTemplateError(languageId.toString(), `Template missing for language ID: ${languageId}`);
      }

      if (!template.templateCode || !template.userFunctionSignature) {
        throw new ProblemTemplateError(languageId.toString(), `Template for language ${languageId} is incomplete`);
      }
    }
  }

  private transformExamples(examples: any[]): any[] {
    return examples.map(example => ({
      input: example.input,
      output: example.output,
      explanation: example.explanation,
      isSample: example.isSample || false
    }));
  }

  private transformConstraints(constraints: any[]): any[] {
    return constraints.map(constraint => ({
      parameterName: constraint.parameterName,
      type: constraint.type,
      minValue: constraint.minValue,
      maxValue: constraint.maxValue,
      minLength: constraint.minLength,
      maxLength: constraint.maxLength
    }));
  }

  private transformParameters(parameters: any[]): any[] {
    return parameters.map(param => ({
      name: param.name,
      type: param.type,
      description: param.description || ''
    }));
  }

  private transformTemplates(templates: Record<number, any>): Record<string, any> {
    const transformed: Record<string, any> = {};
    for (const [languageId, template] of Object.entries(templates)) {
      transformed[languageId] = {
        templateCode: template.templateCode,
        userFunctionSignature: template.userFunctionSignature,
        placeholder: template.placeholder || ''
      };
    }
    return transformed;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
