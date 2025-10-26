



import { 
  InvalidCredentials, 
  WrongPasswordError, 
  UserAlreadyExistsError, 
  OtpExpiredError, 
  MissingFieldsError,
  EmailAlreadyExistsError,
  UsernameAlreadyExistsError,
  FullNameOrUsernameMissingError,
  WeakPasswordError,
  OtpInvalidOrExpiredError,
  UserBlockedError
} from "../../domain/errors/AuthErrors";

import { 
  InsufficientCoinBalanceError,
  InvalidCoinAmountError,
  CoinTransactionNotFoundError,
  InvalidPaymentSignatureError,
  PaymentOrderNotFoundError,
  PaymentAlreadyCompletedError,
  PaymentExpiredError,
  InvalidPaymentStatusError,
  CoinPurchaseFailedError,
  MaxCoinPurchaseLimitExceededError,
  MinCoinPurchaseAmountError,
  UserCoinAccountNotFoundError,
  ConcurrentCoinTransactionError,
  InvalidBalanceAmountError,
  CoinBalanceRetrievalError,
  CoinPurchaseCompletionError,
  UserProfileNotFoundError,
  CoinBalanceUpdateError,
  TransactionRecordingError,
  PurchaseRecordUpdateError,
  InvalidCoinPackageError,
  PaymentOrderCreationError,
  CoinPurchaseRecordError,
  CoinPriceCalculationError,
  CoinStatsRetrievalError,
  CoinTransactionsRetrievalError,
  InvalidPaginationParametersError
} from "../../domain/errors/CoinErrors";

import { HTTP_STATUS } from "../../shared/constants/httpStatus";
import { AppError } from "./AppError";

export class ErrorMapper {
  static toAppError(error: Error): AppError {

    // 400 Bad Request - Validation and input errors
    if (
      error instanceof MissingFieldsError ||
      error instanceof FullNameOrUsernameMissingError ||
      error instanceof WeakPasswordError ||
      error instanceof InvalidCoinAmountError ||
      error instanceof InvalidBalanceAmountError ||
      error instanceof InvalidCoinPackageError ||
      error instanceof InvalidPaginationParametersError ||
      error instanceof InvalidPaymentStatusError
    ) {
      return new AppError(error.message, HTTP_STATUS.BAD_REQUEST);
    }

    // 401 Unauthorized - Authentication failures
    if (
      error instanceof InvalidCredentials ||
      error instanceof WrongPasswordError ||
      error instanceof InvalidPaymentSignatureError
    ) {
      return new AppError(error.message, HTTP_STATUS.UNAUTHORIZED);
    }

    // 402 Payment Required - Insufficient funds
    if (error instanceof InsufficientCoinBalanceError) {
      return new AppError(error.message, HTTP_STATUS.PAYMENT_REQUIRED);
    }

    if(error instanceof UserBlockedError){
      return new AppError(error.message, HTTP_STATUS.FORBIDDEN)
    }

    // 404 Not Found - Entity not found
    if (
      error instanceof CoinTransactionNotFoundError ||
      error instanceof PaymentOrderNotFoundError ||
      error instanceof UserCoinAccountNotFoundError ||
      error instanceof UserProfileNotFoundError
    ) {
      return new AppError(error.message, HTTP_STATUS.NOT_FOUND);
    }

    // 409 Conflict - Resource conflicts
    if (
      error instanceof UserAlreadyExistsError ||
      error instanceof EmailAlreadyExistsError ||
      error instanceof UsernameAlreadyExistsError ||
      error instanceof PaymentAlreadyCompletedError ||
      error instanceof ConcurrentCoinTransactionError
    ) {
      return new AppError(error.message, HTTP_STATUS.CONFLICT);
    }

    // 410 Gone - Expired resources
    if (
      error instanceof OtpExpiredError ||
      error instanceof OtpInvalidOrExpiredError ||
      error instanceof PaymentExpiredError
    ) {
      return new AppError(error.message, HTTP_STATUS.GONE);
    }

    // 422 Unprocessable Entity - Business rule violations
    if (
      error instanceof MaxCoinPurchaseLimitExceededError ||
      error instanceof MinCoinPurchaseAmountError ||
      error instanceof CoinPurchaseFailedError ||
      error instanceof CoinPurchaseCompletionError
    ) {
      return new AppError(error.message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }

    // 500 Internal Server Error - System failures
    if (
      error instanceof CoinBalanceRetrievalError ||
      error instanceof CoinBalanceUpdateError ||
      error instanceof TransactionRecordingError ||
      error instanceof PurchaseRecordUpdateError ||
      error instanceof PaymentOrderCreationError ||
      error instanceof CoinPurchaseRecordError ||
      error instanceof CoinPriceCalculationError ||
      error instanceof CoinStatsRetrievalError ||
      error instanceof CoinTransactionsRetrievalError
    ) {
      return new AppError(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // Default fallback
    return new AppError("Internal Server Error", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
