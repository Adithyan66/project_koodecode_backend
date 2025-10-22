




import { ICodeExecutionService } from '../../../domain/interfaces/services/IJudge0Service';
import { ISubmissionRepository } from '../../../domain/interfaces/repositories/ISubmissionRepository';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ExecuteCodeDto } from '../../dto/submissions/ExecuteCodeDto';
import { TestCaseResult } from '../../../domain/entities/Submission';
import { ITestCaseRepository } from '../../../domain/interfaces/repositories/ITestCaseRepository';
import { SubmissionResponseDto } from '../../dto/submissions/SubmissionResponseDto';
import { inject, injectable } from 'tsyringe';
import { ICodeExecutionHelperService } from '../../interfaces/ICodeExecutionHelperService';
import { ICreateSubmissionUseCase } from '../../interfaces/IProblemUseCase';
import { ProgrammingLanguage } from '../../../domain/value-objects/ProgrammingLanguage';

// Domain Errors
import {
  ProblemNotFoundError,
  NoTestCasesError,
  TemplateNotFoundError,
  InvalidSourceCodeError,
  CodeExecutionError,
  SubmissionCreationError,
  TestCaseExecutionError,
  Judge0ServiceError,
  InvalidLanguageError,
  SubmissionTimeoutError
} from '../../../domain/errors/SubmissionErrors';

// Application Errors
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  TransactionProcessingError
} from '../../errors/AppErrors';

@injectable()
export class CreateSubmissionUseCase implements ICreateSubmissionUseCase {

  private readonly timeLimit = 10;
  private readonly memoryLimit = 262144;
  private readonly maxSourceCodeLength = 50000;

  constructor(
    @inject('ICodeExecutionService') private codeExecutionService: ICodeExecutionService,
    @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository,
    @inject('IProblemRepository') private problemRepository: IProblemRepository,
    @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository,
    @inject('ICodeExecutionHelperService') private codeExecutionHelperService: ICodeExecutionHelperService
  ) { }

  async execute(params: ExecuteCodeDto): Promise<SubmissionResponseDto> {

    let submissionId: string | null = null;

    try {
      this.validateExecutionParams(params);

      const problem = await this.retrieveProblem(params.problemId);

      const allTestCases = await this.retrieveTestCases(params.problemId);

      const template = this.validateLanguageAndGetTemplate(problem, params.languageId);

      const combinedCode = this.validateAndCombineCode(template, params.sourceCode);

      const submission = await this.createInitialSubmission(params, allTestCases.length, params.sourceCode);
      submissionId = submission.id;

      const testCaseResults = await this.executeCodeAgainstTestCases(
        combinedCode,
        params.languageId,
        allTestCases,
        submissionId
      );

      const finalResults = this.calculateFinalResults(testCaseResults);

      const updatedSubmission = await this.updateSubmissionWithResults(
        submissionId,
        testCaseResults,
        finalResults
      );

      return this.buildSubmissionResponse(params, updatedSubmission, testCaseResults, finalResults);

    } catch (error) {
      if (submissionId) {
        await this.handleSubmissionError(submissionId, error);
      }

      if (error instanceof ProblemNotFoundError) {
        throw new NotFoundError(error.message);
      }

      if (error instanceof NoTestCasesError ||
        error instanceof TemplateNotFoundError ||
        error instanceof InvalidLanguageError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof InvalidSourceCodeError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof CodeExecutionError ||
        error instanceof Judge0ServiceError ||
        error instanceof SubmissionTimeoutError) {
        throw new TransactionProcessingError(error.message);
      }

      if (error instanceof SubmissionCreationError) {
        throw new TransactionProcessingError(error.message);
      }

      if (error instanceof NotFoundError ||
        error instanceof BadRequestError ||
        error instanceof TransactionProcessingError) {
        throw error;
      }

      console.error('Unexpected error in CreateSubmissionUseCase:', error);
      throw new TransactionProcessingError("An unexpected error occurred during code execution");
    }
  }

  // ✅ Updated validation using ProgrammingLanguage value object
  private validateExecutionParams(params: ExecuteCodeDto): void {
    if (!params.userId || params.userId.trim().length === 0) {
      throw new BadRequestError("User ID is required");
    }

    if (!params.problemId || params.problemId.trim().length === 0) {
      throw new BadRequestError("Problem ID is required");
    }

    if (!params.sourceCode || params.sourceCode.trim().length === 0) {
      throw new InvalidSourceCodeError("Source code cannot be empty");
    }

    if (params.sourceCode.length > this.maxSourceCodeLength) {
      throw new InvalidSourceCodeError(`Source code exceeds maximum length of ${this.maxSourceCodeLength} characters`);
    }

    if (!params.languageId || !Number.isInteger(params.languageId)) {
      throw new InvalidLanguageError(params.languageId);
    }

    if (!ProgrammingLanguage.isSupported(params.languageId)) {
      throw new InvalidLanguageError(params.languageId);
    }

  }

  private async retrieveProblem(problemId: string) {
    try {
      const problem = await this.problemRepository.findById(problemId);

      if (!problem) {
        throw new ProblemNotFoundError(problemId);
      }

      if (!problem.isActive) {
        throw new ProblemNotFoundError(problemId);
      }

      return problem;
    } catch (error) {
      if (error instanceof ProblemNotFoundError) {
        throw error;
      }
      console.error('Database error while retrieving problem:', error);
      throw new ProblemNotFoundError(problemId);
    }
  }

  private async retrieveTestCases(problemId: string) {
    try {
      const testCases = await this.testCaseRepository.findByProblemId(problemId);

      if (!testCases || testCases.length === 0) {
        throw new NoTestCasesError(problemId);
      }

      return testCases;
    } catch (error) {
      if (error instanceof NoTestCasesError) {
        throw error;
      }
      console.error('Database error while retrieving test cases:', error);
      throw new NoTestCasesError(problemId);
    }
  }

  // ✅ Updated validation using ProgrammingLanguage value object
  private validateLanguageAndGetTemplate(problem: any, languageId: number) {
    // Domain validation first
    if (!ProgrammingLanguage.isSupported(languageId)) {
      throw new InvalidLanguageError(languageId);
    }

    // Problem-specific validation
    if (!problem.supportedLanguages.includes(languageId)) {
      throw new InvalidLanguageError(languageId);
    }

    const template = problem.templates[languageId.toString()];

    if (!template) {
      throw new TemplateNotFoundError(languageId, problem.id);
    }

    if (!template.templateCode || template.templateCode.trim().length === 0) {
      throw new TemplateNotFoundError(languageId, problem.id);
    }

    return template;
  }

  private validateAndCombineCode(template: any, sourceCode: string): string {
    try {
      if (sourceCode.includes('import os') || sourceCode.includes('subprocess') || sourceCode.includes('exec(')) {
        throw new InvalidSourceCodeError("Potentially unsafe code detected");
      }

      const combinedCode = this.codeExecutionHelperService.CombineCodeUseCase(template, sourceCode);

      if (!combinedCode || combinedCode.trim().length === 0) {
        throw new InvalidSourceCodeError("Failed to combine template with source code");
      }

      return combinedCode;
    } catch (error) {
      console.error('Error combining code:', error);
      throw new InvalidSourceCodeError("Failed to process source code with template");
    }
  }

  private async createInitialSubmission(params: ExecuteCodeDto, totalTestCases: number, combinedCode: string) {
    try {
      return await this.submissionRepository.create({
        userId: params.userId,
        problemId: params.problemId,
        sourceCode: combinedCode,
        languageId: params.languageId,
        status: 'pending',
        overallVerdict: 'Processing',
        testCaseResults: [],
        testCasesPassed: 0,
        totalTestCases: totalTestCases,
        score: 0,
        totalExecutionTime: 0,
        maxMemoryUsage: 0,
        submissionType: params.submissionType,
        judge0Token: '',
        output: undefined,
        executionTime: undefined,
        memoryUsage: undefined,
        judge0Status: undefined,
        verdict: undefined
      });
    } catch (error) {
      console.error('Error creating submission:', error);
      throw new SubmissionCreationError("Failed to create submission record");
    }
  }

  private async executeCodeAgainstTestCases(
    sourceCode: string,
    languageId: number,
    testCases: any[],
    submissionId: string
  ): Promise<TestCaseResult[]> {
    try {
      await this.submissionRepository.update(submissionId, { status: 'processing' });

      const testCaseResults = await this.executeAllTestCases(
        sourceCode,
        languageId,
        testCases,
        this.timeLimit,
        this.memoryLimit
      );

      return testCaseResults;
    } catch (error) {
      console.error('Error executing test cases:', error);
      throw new CodeExecutionError("Failed to execute code against test cases");
    }
  }

  private calculateFinalResults(testCaseResults: TestCaseResult[]) {
    try {
      return this.codeExecutionHelperService.calculateResults(testCaseResults, 100);
    } catch (error) {
      console.error('Error calculating results:', error);
      throw new CodeExecutionError("Failed to calculate submission results");
    }
  }

  private async updateSubmissionWithResults(
    submissionId: string,
    testCaseResults: TestCaseResult[],
    finalResults: any
  ) {
    try {
      return await this.submissionRepository.update(submissionId, {
        status: finalResults.status,
        overallVerdict: finalResults.verdict,
        testCaseResults,
        testCasesPassed: testCaseResults.filter(tc => tc.status === 'passed').length,
        score: finalResults.score,
        totalExecutionTime: finalResults.totalTime,
        maxMemoryUsage: finalResults.maxMemory
      });
    } catch (error) {
      console.error('Error updating submission:', error);
      throw new SubmissionCreationError("Failed to update submission with results");
    }
  }


  private buildSubmissionResponse(
    params: ExecuteCodeDto,
    submission: any,
    testCaseResults: TestCaseResult[],
    finalResults: any
  ): SubmissionResponseDto {
    const languageInfo = ProgrammingLanguage.getLanguageInfo(params.languageId);

    return {
      id: submission.id,
      language: {
        id: params.languageId,
        name: languageInfo?.name || 'Unknown'
      },
      maxMemoryUsage: submission.maxMemoryUsage,
      overallVerdict: finalResults.verdict,
      problemId: params.problemId,
      score: finalResults.score,
      status: finalResults.verdict,
      submittedAt: submission.createdAt,
      testCaseResults: testCaseResults,
      testCasesPassed: testCaseResults.filter(tc => tc.status === 'passed').length,
      totalExecutionTime: finalResults.totalTime,
      totalTestCases: testCaseResults.length,
      userId: params.userId
    };
  }

  private async handleSubmissionError(submissionId: string, error: any): Promise<void> {
    try {
      await this.submissionRepository.update(submissionId, {
        status: 'error',
        overallVerdict: 'System Error'
      });
    } catch (updateError) {
      console.error('Failed to update submission error status:', updateError);
    }
  }

  private async executeAllTestCases(
    sourceCode: string,
    languageId: number,
    testCases: any[],
    timeLimit: number,
    memoryLimit: number
  ): Promise<TestCaseResult[]> {

    try {
      const submissions = await Promise.all(
        testCases.map(testCase => {
          const formattedInput = this.codeExecutionHelperService.formatTestCaseInput(testCase.inputs);

          return this.codeExecutionService.submitCode({
            source_code: sourceCode,
            language_id: languageId,
            stdin: formattedInput,
            expected_output: this.codeExecutionHelperService.formatExpectedOutput(testCase.expectedOutput),
            cpu_time_limit: timeLimit,
            memory_limit: memoryLimit,
            wall_time_limit: timeLimit + 1
          });
        })
      );

      const results = await Promise.all(
        submissions.map(async (submission, index) => {
          try {
            const result = await this.codeExecutionHelperService.waitForResult(submission.token);

            return {
              testCaseId: testCases[index].id,
              input: this.codeExecutionHelperService.formatTestCaseInput(testCases[index].inputs),
              expectedOutput: this.codeExecutionHelperService.formatExpectedOutput(testCases[index].expectedOutput),
              actualOutput: result.stdout?.trim(),
              status: this.codeExecutionHelperService.determineTestCaseStatus(result, this.codeExecutionHelperService.formatExpectedOutput(testCases[index].expectedOutput)),
              executionTime: result.time ? parseFloat(result.time) : 0,
              memoryUsage: result.memory || 0,
              judge0Token: submission.token,
              errorMessage: result.stderr || result.compile_output || null
            };

          } catch (error) {
            console.error(`Test case ${index + 1} execution error:`, error);

            return {
              testCaseId: testCases[index].id,
              input: this.codeExecutionHelperService.formatTestCaseInput(testCases[index].inputs),
              expectedOutput: this.codeExecutionHelperService.formatExpectedOutput(testCases[index].expectedOutput),
              actualOutput: 'Execution Error',
              status: 'error' as const,
              executionTime: 0,
              memoryUsage: 0,
              judge0Token: submission.token,
              errorMessage: error instanceof Error ? error.message : 'Unknown execution error'
            };
          }
        })
      );

      return results;
    } catch (error) {
      console.error('Error in executeAllTestCases:', error);
      throw new Judge0ServiceError("Failed to execute test cases via Judge0 service");
    }
  }
}
