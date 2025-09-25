import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { PasswordService } from '../../services/PasswordService';
import { toLoginUserResponse } from '../../services/userMapper';
import { LoginUserResponse } from '../../dto/users/loginUserResponse';
import { SafeUser } from '../../dto/users/safeUser';
import { JwtService } from '../../../infrastructure/services/JwtService';
import { IPasswordService } from '../../../domain/interfaces/services/IPasswordService';

export class LoginUseCase {

    constructor(
        private userRepository: IUserRepository,
        private jwtService: JwtService,
        private passwordService: IPasswordService
    ) { }

    async execute(email: string, password: string): Promise<LoginUserResponse> {

        const user = await this.userRepository.findByEmail(email);


        if (!user) {
            throw new Error('Invalid credentials');
        }

        let passwordValid

        if (user.passwordHash) {

            passwordValid = await this.passwordService.verifyPassword(password, user.passwordHash);
        }

        if (!passwordValid) {

            throw new Error('Invalid credentials');
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

        const response = toLoginUserResponse(safeUser, tokens)

        return response
    }
}
