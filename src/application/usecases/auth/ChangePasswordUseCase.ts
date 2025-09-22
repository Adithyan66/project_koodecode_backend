import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { IPasswordService } from "../../../domain/interfaces/services/IPasswordService";
import { HTTP_STATUS } from "../../../shared/constants/httpStatus";
import { AppError } from "../../../shared/exceptions/AppError";


export class ChangePasswordUseCase {

    constructor(
        private userRepository: IUserRepository,
        private passwordService: IPasswordService
    ) { }

    async execute(userId: string, password: string, newPassword: string) {

        if (!userId || !password || !newPassword) {

            throw new AppError("All fields required", HTTP_STATUS.BAD_REQUEST)
        }

        const user = await this.userRepository.findById(userId)

        if (!user) {

            throw new AppError("User not exist", HTTP_STATUS.NOT_FOUND)
        }
        let passwordValid

        if (user.passwordHash) {

            passwordValid = await this.passwordService.verifyPassword(password, user.passwordHash);
        }

        if (!passwordValid) {
            throw new AppError("password not match", HTTP_STATUS.BAD_REQUEST)
        }

        const passwordHash = await this.passwordService.hashPassword(password);

        const isChanged = await this.userRepository.changePassword(userId, passwordHash,)

        if (!isChanged) {
            throw new AppError("Failed to change Password", HTTP_STATUS.SERVICE_UNAVAILABLE)
        }

    }
}