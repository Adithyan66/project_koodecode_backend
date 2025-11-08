

import { LoginUserResponse } from "../dto/users/loginUserResponse";
import { SignupUserResponse } from "../dto/users/signupUserResponse";
import { ValidateUserResponse } from "../dto/users/ValidateUserResponse";




export interface ISignupUseCase {
    otpRequestExecute(fullName: string, userName: string, email: string): Promise<void>;
    verifyOtpAndSignupExecute(email: string, otp: number, password: string): Promise<SignupUserResponse>;
}

export interface ILoginUseCase {
    execute(email: string, password: string, isAdminLogin?: boolean): Promise<LoginUserResponse>;
}

export interface IValidateUserUseCase {
    execute(token: string): Promise<ValidateUserResponse>;
}

export interface IForgotPasswordUseCase {
    otpRequestExecute(email: string): Promise<{ message: string }>;
    verifyOtp(email: string, otp: number): Promise<{ message: string }>;
    changePAsswordExecute(
        email: string,
        otp: number,
        password: string
    ): Promise<LoginUserResponse>;
}

export interface IGoogleOAuthUseCase {
    execute(token: string): Promise<LoginUserResponse>;
}

export interface IGitHubOAuthUseCase {
    execute(code: string): Promise<LoginUserResponse>;
}


export interface IOtpUseCase {
    generateOtp(): string;
    sendOtp(
        email: string,
        context: "signup" | "forgot",
        extraData?: {
            fullName: string;
            userName: string;
        }
    ): Promise<void>;
    verifyOtp(
        email: string,
        context: "signup" | "forgot",
        otp: number
    ): Promise<{ userName?: string; fullName?: string } | null>;
}

export interface IChangePasswordUseCase {
  execute(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }>;
}
