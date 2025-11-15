


import { injectable, inject } from "tsyringe";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { IPasswordService } from "../../../domain/interfaces/services/IPasswordService";
import { 
  CurrentPasswordIncorrectError, 
  PasswordChangeFailedError,
  NoPasswordSetError,
  SamePasswordError 
} from "../../../domain/errors/AuthErrors";
import { 
  UserNotFoundError, 
  MissingFieldsError 
} from "../../../domain/errors/AuthErrors";
import { IChangePasswordUseCase } from "../../interfaces/IAuthenticationUseCase";



@injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase{

    constructor(
        @inject("IUserRepository") private userRepository: IUserRepository,
        @inject("IPasswordService") private passwordService: IPasswordService
    ) { }

    async execute(userId: string, currentPassword: string, newPassword: string) {

        const missingFields: string[] = [];
        if (!userId) missingFields.push("userId");
        if (!currentPassword) missingFields.push("currentPassword");
        if (!newPassword) missingFields.push("newPassword");

        if (missingFields.length > 0) {
            throw new MissingFieldsError(missingFields);
        }

        if (currentPassword === newPassword) {
            throw new SamePasswordError();
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        if (!user.passwordHash) {
            throw new NoPasswordSetError();
        }

        const isCurrentPasswordValid = await this.passwordService.verifyPassword(
            currentPassword, 
            user.passwordHash
        );

        if (!isCurrentPasswordValid) {
            throw new CurrentPasswordIncorrectError();
        }

        const newPasswordHash = await this.passwordService.hashPassword(newPassword);

        const isChanged = await this.userRepository.changePassword(userId, newPasswordHash);

        if (!isChanged) {
            throw new PasswordChangeFailedError();
        }

        return {
            success: true,
            message: "Password changed successfully"
        };
    }
}
