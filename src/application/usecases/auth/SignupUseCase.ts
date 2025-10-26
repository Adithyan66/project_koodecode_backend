

import { injectable, inject } from "tsyringe";
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { PasswordService } from '../../services/PasswordService';
import { toSignupUserResponse } from '../../services/userMapper';
import { JwtService } from '../../../infrastructure/services/JwtService';
import { OtpUseCase } from '../auth/OtpUseCase';
import { IPasswordService } from '../../../domain/interfaces/services/IPasswordService';
import { IOtpUseCase, ISignupUseCase } from '../../interfaces/IAuthenticationUseCase';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { IOtpRepository } from "../../../domain/interfaces/repositories/IOtpRepository";
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';
import { UserProfile } from '../../../domain/entities/UserProfile';
import { User } from '../../../domain/entities/User';
import { BadRequestError } from "../../errors/AppErrors";
import { EmailAlreadyExistsError, FullNameOrUsernameMissingError, MissingFieldsError, OtpInvalidOrExpiredError, UsernameAlreadyExistsError } from "../../../domain/errors/AuthErrors";



@injectable()
export class SignupUseCase implements ISignupUseCase {

    constructor(
        @inject("IUserRepository") private userRepository: IUserRepository,
        @inject("IOtpUseCase") private otpService: IOtpUseCase,
        @inject("ITokenService") private tokenService: ITokenService,
        @inject("IPasswordService") private passwordService: IPasswordService,
        @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository
    ) { }

    async otpRequestExecute(fullName: string, userName: string, email: string) {

        if (!fullName || !userName || !email) {

            throw new MissingFieldsError(["fullName", "userName", "email"]);
        }

        const existingEmailUser = await this.userRepository.findByEmail(email);
        if (existingEmailUser) throw new EmailAlreadyExistsError(email);


        const existingUsernameUser = await this.userRepository.findByUsername(userName);
        if (existingUsernameUser) throw new UsernameAlreadyExistsError(userName);


        await this.otpService.sendOtp(email, "signup", { fullName, userName });

        // return { success: true, message: "OTP sent to your email" };

    }

    async verifyOtpAndSignupExecute(email: string, otp: number, password: string) {

        if (!email || !otp || !password) {
            throw new BadRequestError("Email, OTP, and password are required");
        }

        const otpRecord = await this.otpService.verifyOtp(email, "signup", otp);

        if (!otpRecord) {
            throw new OtpInvalidOrExpiredError();

        }

        const { fullName, userName } = otpRecord

        if (fullName == undefined || userName == undefined) {
            throw new FullNameOrUsernameMissingError();
        }

        const passwordHash = await this.passwordService.hashPassword(password);

        const user = await this.userRepository.saveUser(new User({
            fullName,
            userName,
            email,
            passwordHash,
            role: "user",
            provider: 'email',
            emailVerified: true,
            isBlocked: false // Explicitly set to false for new users
        }));

        // Create UserProfile with default values for new user
        try {
            const userProfile = new UserProfile({
                userId: user.id!
            });
            await this.userProfileRepository.create(userProfile);
        } catch (error) {
            // Note: User creation rollback not implemented as deleteUser method doesn't exist
            throw new Error("Failed to create user profile. Please contact support.");
        }

        const accessToken = this.tokenService.generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = this.tokenService.generateRefreshToken({ userId: user.id, role: user.role })

        const tokens = {
            accessToken,
            refreshToken
        }

        const response = toSignupUserResponse(user, tokens)

        return response
    }
}
