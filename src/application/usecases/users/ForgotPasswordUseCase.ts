import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { LoginUserResponse } from "../../dto/users/loginUserResponse";
import { SafeUser } from "../../dto/users/safeUser";
import { PasswordService } from "../../services/PasswordService";
import { toLoginUserResponse } from "../../services/userMapper";
import { OtpUseCase } from "./OtpUseCase";


export class ForgotPasswordUseCase {

    constructor(
        private userRepository: IUserRepository,
        private otpService: OtpUseCase,
        private jwtService: JwtService
    ) { }

    async otpRequestExecute(email: string) {

        if (!email) {
            throw new Error("email required")
        }

        const user = await this.userRepository.findByEmail(email)

        if (!user) {
            throw new Error("user not exist")
        }

        await this.otpService.sendOtp(email, "forgot")
    }


    async verifyOtpExecute(email: string, otp: number, password: string): Promise<LoginUserResponse > {

        if (!email || !otp || !password) {
            throw new Error("all fields are required")
        }

        const user = await this.userRepository.findByEmail(email)

        if (!user) {
            throw new Error("user not exist")
        }

        const userId = user?.id

        if (!userId) {
            throw new Error("user id missing")
        }

        const otpRecord = await this.otpService.verifyOtp(email, "forgot", otp)

        console.log("otp recode thaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",otpRecord)

        if (!otpRecord) {
            throw new Error("Invalid or Expired OTP")
        }

        const passwordHash = await PasswordService.hashPassword(password);

        const isChanged = await this.userRepository.changePassword(userId, passwordHash,)

        if (!isChanged) {
            throw new Error("failed to change password")
        }

        const accessToken = this.jwtService.generateAccessToken({ userId, role: user.role });

        const refreshToken = this.jwtService.generateRefreshToken({ userId, role: user.role })

        const safeUser: SafeUser = {
            fullName: user.fullName,
            userName: user.userName,
            email: user.email,
            isAdmin: user.role === "admin",
            profilePicUrl: user.profilePicUrl,
        };

        const tokens = {
            accessToken,
            refreshToken
        }

        const response = toLoginUserResponse(safeUser, tokens)

        return response

    }

}