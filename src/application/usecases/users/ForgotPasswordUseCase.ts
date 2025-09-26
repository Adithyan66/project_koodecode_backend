import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { LoginUserResponse } from "../../dto/users/loginUserResponse";
import { SafeUser } from "../../dto/users/safeUser";
import { toLoginUserResponse } from "../../services/userMapper";
import { OtpUseCase } from "./OtpUseCase";
import { AppError } from "../../../shared/exceptions/AppError";
import { HTTP_STATUS } from "../../../shared/constants/httpStatus";
import { IPasswordService } from "../../../domain/interfaces/services/IPasswordService";


export class ForgotPasswordUseCase {

    constructor(
        private userRepository: IUserRepository,
        private otpService: OtpUseCase,
        private jwtService: JwtService,
        private passwordService: IPasswordService
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

    async verifyOtp(email: string, otp: number) {

        if (!email || !otp) {
            throw new AppError("all fields are required", HTTP_STATUS.BAD_REQUEST)
        }

        const user = await this.userRepository.findByEmail(email)

        if (!user) {
            throw new AppError("user not exist", HTTP_STATUS.BAD_REQUEST)
        }

        const otpRecord = await this.otpService.verifyOtp(email, "forgot", otp)

        console.log("strrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", otpRecord);


        if (!otpRecord) {
            throw new AppError("Invalid or Expired OTP", HTTP_STATUS.BAD_REQUEST)
        }

        return true
    }


    async changePAsswordExecute(email: string, otp: number, password: string): Promise<LoginUserResponse> {

        if (!email || !otp || !password) {
            throw new AppError("all fields are required", HTTP_STATUS.BAD_REQUEST)
        }

        const user = await this.userRepository.findByEmail(email)

        if (!user) {
            throw new AppError("user not exist", HTTP_STATUS.BAD_REQUEST)
        }

        const userId = user?.id

        if (!userId) {
            throw new AppError("user id missing", HTTP_STATUS.BAD_REQUEST)
        }

        const otpRecord = await this.otpService.verifyOtp(email, "forgot", otp)

        if (!otpRecord) {
            throw new AppError("Invalid or Expired OTP", HTTP_STATUS.BAD_REQUEST)
        }

        const passwordHash = await this.passwordService.hashPassword(password);

        const isChanged = await this.userRepository.changePassword(userId, passwordHash,)

        if (!isChanged) {
            throw new AppError("failed to change password", HTTP_STATUS.BAD_REQUEST)
        }

        const accessToken = this.jwtService.generateAccessToken({ userId, role: user.role });

        const refreshToken = this.jwtService.generateRefreshToken({ userId, role: user.role })

        const safeUser: SafeUser = {
            id: user.id!,
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