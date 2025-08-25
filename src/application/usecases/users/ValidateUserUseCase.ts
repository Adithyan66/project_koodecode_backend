// src/usecases/ValidateUserUseCase.ts
import { IUserRepository } from '../../interfaces/IUserRepository';
import { JwtService } from '../../../infrastructure/services/JwtService';
import { User } from '../../../domain/entities/User';
import { log } from 'console';

export interface ValidateUserResponse {
    success: boolean;
    user?: {
        fullName: string;
        userName: string;
        email: string;
        isAdmin: boolean;
        profilePicUrl?: string;
    };
    message: string;
}

export class ValidateUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService
    ) {}

    async execute(token: string): Promise<ValidateUserResponse> {
        try {
            if (!token) {
                return {
                    success: false,
                    message: 'Token is required'
                };
            }
            
            
            // Check if token is blacklisted
            const isBlacklisted = await this.jwtService.isBlacklisted(token);
            if (isBlacklisted) {
                return {
                    success: false,
                    message: 'Token has been revoked'
                };
            }
            
            // Verify access token
            const decoded = this.jwtService.verifyAccessToken(token);
            
            
            if (!decoded || typeof decoded !== 'object') {
                return {
                    success: false,
                    message: 'Invalid or expired token'
                };
            }
            
            // Extract user ID from token payload
            const userId =  (decoded as any).userId;
            if (!userId) {
                return {
                    success: false,
                    message: 'Invalid token payload'
                };
            }

            const user = await this.userRepository.findById(userId);
            
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            return {
                success: true,
                user: {
                    fullName: user.fullName,
                    userName: user.userName,
                    email: user.email,
                    isAdmin: user.role == "admin",
                    profilePicUrl: user.profilePicUrl
                },
                message: 'User validated successfully'
            };

        } catch (error) {
            console.error('ValidateUserUseCase error:', error);
            return {
                success: false,
                message: 'Token validation failed'
            };
        }
    }
}
