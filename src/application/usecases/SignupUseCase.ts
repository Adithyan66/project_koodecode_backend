import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { PasswordService } from '../../domain/services/PasswordService';
// import { OtpService } from '../../infrastructure/services/NodemailerEmailService'; // service to generate/send OTP
import { IOtpRepository } from '../interfaces/IOtpRepository';
import { IEmailService } from '../interfaces/IEmailService';
import { OtpUseCase } from './OtpUseCase';

export class SignupUseCase {

    constructor(
        private userRepository: IUserRepository,
        private otpService: OtpUseCase,
    ) { }

    async otpRequestExecute(fullName: string, userName: string, email: string) {

        if (!fullName || !userName || !email) {
            throw new Error("All fields are required");
        }

        const existingEmailUser = await this.userRepository.findByEmail(email);

        const existingUsernameUser = await this.userRepository.findByUsername(userName);

        if (existingEmailUser) throw new Error("Email already exists");

        if (existingUsernameUser) throw new Error("Username already exists");


        // const otp = this.otpService.sentOtp();

        await this.otpService.sendOtp(email, fullName, userName);

        // const data = { otp, fullName, userName }

        // await this.otpService.saveOtp(email, data, 600);

        return { success: true, message: "OTP sent to your email" };

    }

    async verifyOtpAndSignupExecute(email: string, otp: number, password: string) {

        if (!email || !otp || !password) {
            throw new Error("Email, OTP, and password are required")
        }

        const otpRecord = await this.otpService.getOtpByEmail(email);

    }
}
