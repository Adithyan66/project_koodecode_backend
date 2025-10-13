

import { DomainError } from "./DomainError";

export class ProblemAlreadyExistsError extends DomainError {
  constructor(title: string) {
    super(`Problem with title "${title}" already exists`);
  }
}

export class InvalidProblemDataError extends DomainError {
  constructor(field: string, reason: string) {
    super(`Invalid problem data for field "${field}": ${reason}`);
  }
}

export class TestCaseValidationError extends DomainError {
  constructor(message: string) {
    super(`Test case validation failed: ${message}`);
  }
}

export class ProblemParameterError extends DomainError {
  constructor(parameterName: string, issue: string) {
    super(`Problem parameter "${parameterName}" error: ${issue}`);
  }
}

export class ProblemTemplateError extends DomainError {
  constructor(language: string, issue: string) {
    super(`Problem template for "${language}" error: ${issue}`);
  }
}

export class ProblemCreationError extends DomainError {
  constructor(reason: string) {
    super(`Failed to create problem: ${reason}`);
  }
}

export class ProblemNotFoundError extends DomainError {
  constructor(identifier: string, type: 'id' | 'slug' = 'slug') {
    super(`Problem with ${type} "${identifier}" not found`);
  }
}

export class ProblemInactiveError extends DomainError {
  constructor(identifier: string) {
    super(`Problem "${identifier}" is currently inactive`);
  }
}

export class ProblemAccessError extends DomainError {
  constructor(reason: string) {
    super(`Problem access denied: ${reason}`);
  }
}

export class TestCaseRetrievalError extends DomainError {
  constructor(problemId: string) {
    super(`Failed to retrieve test cases for problem ID: ${problemId}`);
  }
}


export class InvalidPaginationError extends DomainError {
  constructor(field: string, value: any, reason: string) {
    super(`Invalid pagination parameter "${field}": ${value}. ${reason}`);
  }
}

export class InvalidFilterError extends DomainError {
  constructor(field: string, value: any, reason: string) {
    super(`Invalid filter parameter "${field}": ${value}. ${reason}`);
  }
}

export class ProblemListRetrievalError extends DomainError {
  constructor(reason: string) {
    super(`Failed to retrieve problem list: ${reason}`);
  }
}

export class ProblemListProcessingError extends DomainError {
  constructor(reason: string) {
    super(`Failed to process problem list: ${reason}`);
  }
}

export class NoSupportedLanguagesError extends DomainError {
  constructor() {
    super(`No supported programming languages found from language service`);
  }
}

export class LanguageServiceUnavailableError extends DomainError {
  constructor(serviceName: string) {
    super(`Language service "${serviceName}" is currently unavailable`);
  }
}

export class TemplateNotFoundError extends DomainError {
  constructor(languageId: number) {
    super(`Template not found for language ID: ${languageId}`);
  }
}