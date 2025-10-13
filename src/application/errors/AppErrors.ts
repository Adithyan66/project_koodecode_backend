
import { HTTP_STATUS } from "../../shared/constants/httpStatus";
import { AppError } from "./AppError";



export class BadRequestError extends AppError {

  constructor(message = "Bad request", details?: Record<string, string>) {

    super(message, HTTP_STATUS.BAD_REQUEST, true, details);
  }
}

export class UnauthorizedError extends AppError {

  constructor(message = "not authorized", details?: Record<string, string>) {

    super(message, HTTP_STATUS.UNAUTHORIZED, true, details);
  }
}


export class NotFoundError extends AppError {

  constructor(message = "not found", details?: Record<string, string>) {

    super(message, HTTP_STATUS.BAD_REQUEST, true, details);
  }
}


export class ConflictError extends AppError {

  constructor(message = "Conflict error", details?: Record<string, string>) {

    super(message, HTTP_STATUS.CONFLICT, true, details);
  }
}


export class PaymentVerificationError extends AppError {
  constructor(message = "Payment verification failed", details?: Record<string, string>) {
    super(message, HTTP_STATUS.BAD_REQUEST, true, details);
  }
}

export class PaymentGatewayError extends AppError {
  constructor(message = "Payment gateway error occurred", details?: Record<string, string>) {
    super(message, HTTP_STATUS.BAD_GATEWAY, true, details);
  }
}

export class InsufficientFundsError extends AppError {
  constructor(message = "Insufficient funds for this transaction", details?: Record<string, string>) {
    super(message, HTTP_STATUS.BAD_REQUEST, true, details);
  }
}

export class TransactionProcessingError extends AppError {
  constructor(message = "Error processing transaction", details?: Record<string, string>) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, true, details);
  }
}

export class InvalidTransactionDataError extends AppError {
  constructor(message = "Invalid transaction data provided", details?: Record<string, string>) {
    super(message, HTTP_STATUS.BAD_REQUEST, true, details);
  }
}

export class PasswordChangeValidationError extends AppError {
  constructor(message = "Password change validation failed", details?: Record<string, string>) {
    super(message, HTTP_STATUS.BAD_REQUEST, true, details);
  }
}

export class PasswordServiceUnavailableError extends AppError {
  constructor(message = "Password service is temporarily unavailable", details?: Record<string, string>) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, true, details);
  }
}


export class SubmissionRetrievalError extends AppError {
  constructor(submissionId: string, details?: Record<string, string>) {
    super(`Failed to retrieve submission result for ID: ${submissionId}`, HTTP_STATUS.INTERNAL_SERVER_ERROR, true, details);
  }
}

export class CodeExecutionServiceError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super(`Code execution service error: ${message}`, HTTP_STATUS.BAD_GATEWAY, true, details);
  }
}

export class SubmissionUpdateError extends AppError {
  constructor(submissionId: string, details?: Record<string, string>) {
    super(`Code execution service error: ${submissionId}`, HTTP_STATUS.INTERNAL_SERVER_ERROR, true, details);
  }
}


export class CodeExecutionError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super(`Code execution failed: ${message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR, true, details);
  }
}

export class TestCaseExecutionError extends AppError {
  constructor(testCaseId: string, details?: Record<string, string>) {
    super(`Failed to execute test case ${testCaseId}`, HTTP_STATUS.INTERNAL_SERVER_ERROR, true, details);
  }
}

export class CodeTemplateProcessingError extends AppError {
  constructor(languageId: number, details?: Record<string, string>) {
    super(`Failed to process code template for language ${languageId}`, HTTP_STATUS.BAD_REQUEST, true, details);
  }
}