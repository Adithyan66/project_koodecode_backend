import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { PasswordService } from '../../domain/services/PasswordService';
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

        await this.otpService.sendOtp(email, fullName, userName);

        return { success: true, message: "OTP sent to your email" };

    }

    async verifyOtpAndSignupExecute(email: string, otp: number, password: string) {

        if (!email || !otp || !password) {

            throw new Error("Email, OTP, and password are required")
        }

        const otpRecord = await this.otpService.verifyOtp(email, otp);

        if (!otpRecord) {
            throw new Error("Invalid or Expired OTP")
        }

        const passwordHash = await PasswordService.hashPassword(password);

        const user = await this.userRepository.saveUser({
            fullName: otpRecord.fullName,
            userName: otpRecord.userName,
            email,
            passwordHash,
            isAdmin: false
        });

        console.log("user", otpRecord);


        return user
    }
}
