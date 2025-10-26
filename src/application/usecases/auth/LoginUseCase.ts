


import { injectable, inject } from "tsyringe";
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { PasswordService } from '../../services/PasswordService';
import { toLoginUserResponse } from '../../services/userMapper';
import { LoginUserResponse } from '../../dto/users/loginUserResponse';
import { SafeUser } from '../../dto/users/safeUser';
import { JwtService } from '../../../infrastructure/services/JwtService';
import { IPasswordService } from '../../../domain/interfaces/services/IPasswordService';
import { ILoginUseCase } from '../../interfaces/IAuthenticationUseCase';
import { InvalidCredentials, WrongPasswordError, UserBlockedError } from '../../../domain/errors/AuthErrors';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';



@injectable()
export class LoginUseCase implements ILoginUseCase {

    constructor(
        @inject("IUserRepository") private userRepository: IUserRepository,
        @inject("ITokenService") private jwtService: ITokenService,
        @inject("IPasswordService") private passwordService: IPasswordService
    ) { }

    async execute(email: string, password: string): Promise<LoginUserResponse> {

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new InvalidCredentials();
        }

        // Check if user is blocked
        if (user.isBlocked) {
            throw new UserBlockedError();
        }

        let passwordValid

        if (user.passwordHash) {
            passwordValid = await this.passwordService.verifyPassword(password, user.passwordHash);
        }

        if (!passwordValid) {
            throw new WrongPasswordError();
        }

        const accessToken = this.jwtService.generateAccessToken({ userId: user.id, role: user.role });

        const refreshToken = this.jwtService.generateRefreshToken({ userId: user.id, role: user.role })

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

        return toLoginUserResponse(safeUser, tokens)
    }
}
