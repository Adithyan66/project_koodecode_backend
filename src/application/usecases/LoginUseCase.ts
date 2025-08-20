import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { PasswordService } from '../../domain/services/PasswordService';
// import { JwtService } from '../../infrastructure/external/JwtService';
import { JwtService } from '../../infrastructure/services/JwtService';

export class LoginUseCase {

    constructor(private userRepository: IUserRepository, private jwtService: JwtService) { }

    async execute(email: string, password: string): Promise<{ token: string }> {

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const passwordValid = await PasswordService.verifyPassword(password, user.passwordHash);

        if (!passwordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.jwtService.generateToken({ userId: user.userName, email: user.email });

        return { token };
    }
}
