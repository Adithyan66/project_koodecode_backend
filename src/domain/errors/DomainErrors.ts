
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
