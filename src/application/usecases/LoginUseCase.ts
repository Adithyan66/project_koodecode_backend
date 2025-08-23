import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { PasswordService } from '../../domain/services/PasswordService';
import { toLoginUserResponse } from '../../domain/services/userMapper';
import { LoginUserResponse } from '../../dto/loginUserResponse';
import { JwtService } from '../../infrastructure/services/JwtService';

export class LoginUseCase {

    constructor(
        private userRepository: IUserRepository,
        private jwtService: JwtService) { }

    async execute(email: string, password: string): Promise<LoginUserResponse> {

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        let passwordValid

        if (user.passwordHash) {

            passwordValid = await PasswordService.verifyPassword(password, user.passwordHash);
        }

        if (!passwordValid) {
            throw new Error('Invalid credentials');
        }

        const accessToken = this.jwtService.generateAccessToken({ userId: user.userName, email: user.email });

        const refreshToken = this.jwtService.generateRefreshToken({ userId: user.userName, email: user.email })

        const safeUser = {
            fullName: user.fullName,
            userName: user.userName,
            email: user.email,
            isAdmin: user.isAdmin,
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
