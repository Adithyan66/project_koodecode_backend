
import { DomainError } from "./DomainError";

export class UserAlreadyExistsError extends DomainError {
  constructor() {
    super("User already exists");
  }
}

export class WrongPasswordError extends DomainError {
  constructor() {
    super("Incorrect password");
  }
}

export class OtpExpiredError extends DomainError {
  constructor() {
    super("OTP has expired");
  }
}


export class InvalidCredentials extends DomainError {
  constructor() {
    super("Invalid credentials");
  }
}


export class MissingFieldsError extends DomainError {
  constructor(fields: string[]) {
    super(`Missing required fields: ${fields.join(", ")}`);
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`Email "${email}" is already registered`);
  }
}

export class UsernameAlreadyExistsError extends DomainError {
  constructor(userName: string) {
    super(`Username "${userName}" is already taken`);
  }
}

export class OtpInvalidOrExpiredError extends DomainError {
  constructor() {
    super("OTP is invalid or has expired");
  }
}

export class FullNameOrUsernameMissingError extends DomainError {
  constructor() {
    super("Full name or username missing in OTP record");
  }
}

export class WeakPasswordError extends DomainError {
  constructor() {
    super("Password does not meet strength requirements");
  }
}

export class CurrentPasswordIncorrectError extends DomainError {
  constructor() {
    super("Current password is incorrect");
  }
}

export class PasswordChangeFailedError extends DomainError {
  constructor() {
    super("Failed to change password due to system error");
  }
}

export class SamePasswordError extends DomainError {
  constructor() {
    super("New password must be different from current password");
  }
}

export class WeakNewPasswordError extends DomainError {
  constructor() {
    super("New password does not meet security requirements");
  }
}

export class NoPasswordSetError extends DomainError {
  constructor() {
    super("User account does not have a password set");
  }
}

export class PasswordPolicyViolationError extends DomainError {
  constructor(reason: string) {
    super(`Password policy violation: ${reason}`);
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super(`user not found`);
  }
}

export class UserBlockedError extends DomainError {
    constructor() {
        super("Your account has been blocked. Please contact support for assistance.");
    }
}
