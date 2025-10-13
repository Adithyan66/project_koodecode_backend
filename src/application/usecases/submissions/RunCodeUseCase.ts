



import { TestCaseResult } from "../../../domain/entities/Submission";
import { RunCodeDto, RunCodeResponseDto } from "../../dto/submissions/RunCodeDto";
import { ICodeExecutionService } from "../../../domain/interfaces/services/IJudge0Service";
import { IProblemRepository } from "../../../domain/interfaces/repositories/IProblemRepository";
import { ITestCaseRepository } from "../../../domain/interfaces/repositories/ITestCaseRepository";
import { inject, injectable } from "tsyringe";
import { ICodeExecutionHelperService } from "../../interfaces/ICodeExecutionHelperService";
import { ProgrammingLanguage } from "../../../domain/value-objects/ProgrammingLanguage";

import { ProblemNotFoundError, TemplateNotFoundError } from '../../../domain/errors/ProblemErrors';
import { TestCaseNotFoundError, NoValidTestCasesError } from '../../../domain/errors/SubmissionErrors';
import { UnsupportedLanguageError } from '../../../domain/errors/SubmissionErrors';

import {
  CodeExecutionError,
  TestCaseExecutionError,
  CodeTemplateProcessingError
} from '../../errors/AppErrors';

@injectable()
export class RunCodeUseCase {
  timeLimit = 10;
  memoryLimit = 262144;

  constructor(
    @inject("ICodeExecutionService") private judge0Service: ICodeExecutionService,
    @inject("IProblemRepository") private problemRepository: IProblemRepository,
    @inject("ITestCaseRepository") private testCaseRepository: ITestCaseRepository,
    @inject("ICodeExecutionHelperService") private codeExecutionHelperService: ICodeExecutionHelperService
  ) { }

  async execute(params: RunCodeDto): Promise<RunCodeResponseDto> {
    try {
      // Validate programming language
      if (!ProgrammingLanguage.isSupported(params.languageId)) {
        throw new UnsupportedLanguageError(params.languageId);
      }

      const problem = await this.problemRepository.findById(params.problemId);
      if (!problem) {
        throw new ProblemNotFoundError(params.problemId);
      }

      const allTestCases = await this.retrieveTestCases(params.testCases);
      const validTestCases = allTestCases.filter((tc: any) => tc !== null);

      if (validTestCases.length === 0) {
        throw new NoValidTestCasesError();
      }

      const template = problem.templates[params.languageId];
      if (!template) {
        throw new TemplateNotFoundError(params.languageId);
      }

      const code = this.combineCodeWithTemplate(template, params.sourceCode, params.languageId);

      const testCaseResults = await this.executeAllTestCases(
        code,
        params.languageId,
        validTestCases,
        this.timeLimit,
        this.memoryLimit
      );

      const { verdict, status, score, totalTime, maxMemory } = this.codeExecutionHelperService.calculateResults(
        testCaseResults,
        100
      );

      return {
        verdict,
        status,
        score,
        totalTime,
        maxMemory,
        testCaseResults,
        totalTestCases: testCaseResults.length,
        passedTestCases: testCaseResults.filter(r => r.status === 'passed').length,
        failedTestCases: testCaseResults.filter(r => r.status === 'failed').length
      };

    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof ProblemNotFoundError ||
        error instanceof TemplateNotFoundError ||
        error instanceof TestCaseNotFoundError ||
        error instanceof NoValidTestCasesError ||
        error instanceof UnsupportedLanguageError) {
        throw error;
      }

      // Re-throw application errors as-is
      if (error instanceof CodeExecutionError ||
        error instanceof TestCaseExecutionError ||
        error instanceof CodeTemplateProcessingError) {
        throw error;
      }

      // Wrap unexpected errors
      throw new CodeExecutionError(
        'Unexpected error during code execution');
    }
  }

  private async retrieveTestCases(testCaseIds: string[]): Promise<any[]> {
    try {
      return await Promise.all(
        testCaseIds.map(async (id) => {
          const testCase = await this.testCaseRepository.findById(id);
          if (!testCase) {
            throw new TestCaseNotFoundError(id);
          }
          return testCase;
        })
      );
    } catch (error) {
      if (error instanceof TestCaseNotFoundError) {
        throw error;
      }
      throw new CodeExecutionError('Failed to retrieve test cases');
    }
  }

  private combineCodeWithTemplate(template: object, sourceCode: string, languageId: number): string {
    try {
      return this.codeExecutionHelperService.CombineCodeUseCase(template, sourceCode);
    } catch (error) {
      throw new CodeTemplateProcessingError(languageId);
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
      const submissions = await this.submitAllTestCases(
        sourceCode,
        languageId,
        testCases,
        timeLimit,
        memoryLimit
      );

      const results = await Promise.all(
        submissions.map(async (submission, index) => {
          return await this.processTestCaseResult(submission, testCases[index], index);
        })
      );

      return results;

    } catch (error) {
      throw new CodeExecutionError('Failed to execute test cases');
    }
  }

  private async submitAllTestCases(
    sourceCode: string,
    languageId: number,
    testCases: any[],
    timeLimit: number,
    memoryLimit: number
  ): Promise<any[]> {
    try {
      return await Promise.all(
        testCases.map(testCase => {
          const formattedInput = this.codeExecutionHelperService.formatTestCaseInput(testCase.inputs);

          return this.judge0Service.submitCode({
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
    } catch (error) {
      throw new CodeExecutionError('Failed to submit code to execution service');
    }
  }

  private async processTestCaseResult(submission: any, testCase: any, index: number): Promise<TestCaseResult> {
    try {
      const result = await this.codeExecutionHelperService.waitForResult(submission.token);
      const expectedOut = this.codeExecutionHelperService.formatExpectedOutput(testCase.expectedOutput);
      const status = this.codeExecutionHelperService.determineTestCaseStatus(result, expectedOut);

      return {
        testCaseId: testCase.id,
        input: this.codeExecutionHelperService.formatTestCaseInput(testCase.inputs),
        expectedOutput: this.codeExecutionHelperService.formatExpectedOutput(testCase.expectedOutput),
        actualOutput: result.stdout?.trim(),
        status,
        executionTime: result.time ? parseFloat(result.time) : 0,
        memoryUsage: result.memory || 0,
        judge0Token: submission.token,
        errorMessage: result.stderr || result.compile_output || null
      };

    } catch (error) {
      throw new TestCaseExecutionError(testCase.id);
    }
  }
}
