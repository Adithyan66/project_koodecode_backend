
import { DomainError } from "./DomainError";

export class InsufficientCoinBalanceError extends DomainError {
  constructor(required: number, available: number) {
    super(`Insufficient coin balance. Required: ${required}, Available: ${available}`);
  }
}

export class InvalidCoinAmountError extends DomainError {
  constructor(amount: number) {
    super(`Invalid coin amount: ${amount}. Amount must be positive`);
  }
}

export class CoinTransactionNotFoundError extends DomainError {
  constructor(transactionId: string) {
    super(`Coin transaction with ID "${transactionId}" not found`);
  }
}

export class InvalidPaymentSignatureError extends DomainError {
  constructor() {
    super("Payment signature verification failed");
  }
}

export class PaymentOrderNotFoundError extends DomainError {
  constructor(orderId: string) {
    super(`Payment order with ID "${orderId}" not found`);
  }
}

export class PaymentAlreadyCompletedError extends DomainError {
  constructor(orderId: string) {
    super(`Payment for order "${orderId}" has already been completed`);
  }
}

export class PaymentExpiredError extends DomainError {
  constructor(orderId: string) {
    super(`Payment order "${orderId}" has expired`);
  }
}

export class InvalidPaymentStatusError extends DomainError {
  constructor(status: string) {
    super(`Invalid payment status: ${status}`);
  }
}

export class CoinPurchaseFailedError extends DomainError {
  constructor(reason: string) {
    super(`Coin purchase failed: ${reason}`);
  }
}

export class MaxCoinPurchaseLimitExceededError extends DomainError {
  constructor(limit: number, requested: number) {
    super(`Maximum coin purchase limit exceeded. Limit: ${limit}, Requested: ${requested}`);
  }
}

export class MinCoinPurchaseAmountError extends DomainError {
  constructor(minimum: number, requested: number) {
    super(`Minimum coin purchase amount not met. Minimum: ${minimum}, Requested: ${requested}`);
  }
}

export class UserCoinAccountNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`Coin account for user "${userId}" not found`);
  }
}

export class ConcurrentCoinTransactionError extends DomainError {
  constructor() {
    super("Concurrent coin transaction detected. Please try again");
  }
}


export class InvalidBalanceAmountError extends DomainError {
    constructor(amount: number) {
        super(`Invalid amount specified: ${amount}. Amount must be positive`);
    }
}

export class CoinBalanceRetrievalError extends DomainError {
    constructor(userId: string) {
        super(`Failed to retrieve coin balance for user "${userId}"`);
    }
}

export class CoinPurchaseCompletionError extends DomainError {
  constructor(reason: string) {
    super(`Coin purchase completion failed: ${reason}`);
  }
}

export class UserProfileNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User profile for user ID "${userId}" not found`);
  }
}

export class CoinBalanceUpdateError extends DomainError {
  constructor(userId: string) {
    super(`Failed to update coin balance for user "${userId}"`);
  }
}

export class TransactionRecordingError extends DomainError {
  constructor(userId: string, amount: number) {
    super(`Failed to record coin transaction for user "${userId}" with amount ${amount}`);
  }
}

export class PurchaseRecordUpdateError extends DomainError {
  constructor(purchaseId: string) {
    super(`Failed to update purchase record "${purchaseId}"`);
  }
}


export class InvalidCoinPackageError extends DomainError {
    constructor(coins: number) {
        super(`Invalid coin package: ${coins}. Package not available`);
    }
}

export class PaymentOrderCreationError extends DomainError {
    constructor(reason: string) {
        super(`Payment order creation failed: ${reason}`);
    }
}

export class CoinPurchaseRecordError extends DomainError {
    constructor(reason: string) {
        super(`Coin purchase record creation failed: ${reason}`);
    }
}

export class CoinPriceCalculationError extends DomainError {
    constructor(coins: number) {
        super(`Failed to calculate price for ${coins} coins`);
    }
}

export class CoinStatsRetrievalError extends DomainError {
    constructor(userId: string) {
        super(`Failed to retrieve coin statistics for user "${userId}"`);
    }
}

export class CoinTransactionsRetrievalError extends DomainError {
    constructor(userId: string) {
        super(`Failed to retrieve coin transactions for user "${userId}"`);
    }
}

export class InvalidPaginationParametersError extends DomainError {
    constructor(reason: string) {
        super(`Invalid pagination parameters: ${reason}`);
    }
}

export class WebhookVerificationFailedError extends DomainError {
    constructor() {
        super("Webhook signature verification failed");
    }
}

export class PaymentNotCapturedError extends DomainError {
    constructor() {
        super("Payment has not been captured yet");
    }
}

export class PaymentAmountMismatchError extends DomainError {
    constructor(expected?: number, actual?: number) {
        const message = expected !== undefined && actual !== undefined
            ? `Payment amount mismatch. Expected: ₹${expected}, Actual: ₹${actual}`
            : "Payment amount does not match order amount";
        super(message);
    }
}

export class ReconciliationNotAllowedError extends DomainError {
    constructor(reason: string) {
        super(`Cannot reconcile purchase: ${reason}`);
    }
}
