import { LoginUserResponse } from "../dto/users/loginUserResponse";
import { SignupUserResponse } from "../dto/users/signupUserResponse";
import { ValidateUserResponse } from "../dto/users/ValidateUserResponse";

export interface ISignupUseCase {

    otpRequestExecute(fullName: string, userName: string, email: string): Promise<void>;

    verifyOtpAndSignupExecute(email: string, otp: number, password: string): Promise<SignupUserResponse>;
}

export interface ILoginUseCase {

    execute(email: string, password: string): Promise<LoginUserResponse>;

}

export interface IValidateUserUseCase {

    execute(token: string): Promise<ValidateUserResponse>;
}