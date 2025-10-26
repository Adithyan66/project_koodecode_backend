

import { injectable, inject } from "tsyringe";
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { ValidateUserResponse } from '../../dto/users/ValidateUserResponse';
import { BadRequestError, UnauthorizedError, NotFoundError } from "../../errors/AppErrors"
import { IValidateUserUseCase } from "../../interfaces/IAuthenticationUseCase";
import { UserBlockedError } from '../../../domain/errors/AuthErrors';


@injectable()
export class ValidateUserUseCase implements IValidateUserUseCase{
    constructor(
        @inject("IUserRepository") private readonly userRepository: IUserRepository,
        @inject("ITokenService") private readonly jwtService: ITokenService
    ) { }

    async execute(token: string): Promise<ValidateUserResponse> {
        if (!token) {
            throw new BadRequestError('Token is required');
        }

        const isBlacklisted = await this.jwtService.isBlacklisted(token);
        if (isBlacklisted) {
            throw new UnauthorizedError('Token has been revoked');
        }

        const decoded = this.jwtService.verifyAccessToken(token);

        if (!decoded || typeof decoded !== 'object') {
            throw new UnauthorizedError('Invalid or expired token');
        }

        const userId = (decoded as any).userId;
        if (!userId) {
            throw new UnauthorizedError('Invalid token payload');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.isBlocked) {
            throw new UserBlockedError();
        }

        return {
            success: true,
            user: {
                id: user.id!,
                fullName: user.fullName,
                userName: user.userName,
                email: user.email,
                isAdmin: user.role === 'admin',
                profilePicUrl: user.profilePicUrl
            },
            message: 'User validated successfully'
        };
    }
}
