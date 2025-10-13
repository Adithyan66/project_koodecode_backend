

import { DomainError } from "./DomainError";

export class ProblemNotFoundError extends DomainError {
  constructor(problemId: string) {
    super(`Problem with ID "${problemId}" not found`);
  }
}

export class NoTestCasesError extends DomainError {
  constructor(problemId: string) {
    super(`Problem "${problemId}" has no test cases configured`);
  }
}

export class TemplateNotFoundError extends DomainError {
  constructor(languageId: number, problemId: string) {
    super(`Template not found for language ID ${languageId} in problem "${problemId}"`);
  }
}

export class InvalidSourceCodeError extends DomainError {
  constructor(reason: string) {
    super(`Invalid source code: ${reason}`);
  }
}

export class CodeExecutionError extends DomainError {
  constructor(reason: string) {
    super(`Code execution failed: ${reason}`);
  }
}

export class SubmissionCreationError extends DomainError {
  constructor(reason: string) {
    super(`Failed to create submission: ${reason}`);
  }
}

export class TestCaseExecutionError extends DomainError {
  constructor(testCaseId: string, reason: string) {
    super(`Test case "${testCaseId}" execution failed: ${reason}`);
  }
}

export class Judge0ServiceError extends DomainError {
  constructor(reason: string) {
    super(`Judge0 service error: ${reason}`);
  }
}

export class InvalidLanguageError extends DomainError {
  constructor(languageId: number) {
    super(`Unsupported or invalid language ID: ${languageId}`);
  }
}

export class SubmissionTimeoutError extends DomainError {
  constructor(timeLimit: number) {
    super(`Submission execution timed out after ${timeLimit} seconds`);
  }
}

export class SubmissionNotFoundError extends DomainError {
  constructor(submissionId: string) {
    super(`Submission with ID ${submissionId} not found`);
  }
}

export class InvalidSubmissionStateError extends DomainError {
  constructor(currentState: string, expectedState: string) {
    super(`Invalid submission state. Current: ${currentState}, Expected: ${expectedState}`);
  }
}

export class UnsupportedLanguageError extends DomainError {
  constructor(languageId: number) {
    super(`Programming language with ID ${languageId} is not supported`);
  }
}


export class TestCaseNotFoundError extends DomainError {
  constructor(testCaseId: string) {
    super(`Test case with ID ${testCaseId} not found`);
  }
}

export class NoValidTestCasesError extends DomainError {
  constructor() {
    super('No valid test cases found for execution');
  }
}