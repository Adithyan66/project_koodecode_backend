

import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import { inject, injectable } from 'tsyringe';
import { buildResponse } from '../../../infrastructure/utils/responseBuilder';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserBlockedError } from '../../../domain/errors/AuthErrors';

interface JwtPayload {
    userId: string;
    role: string;
}

interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

@injectable()
export class AuthMiddleware {

    constructor(
        @inject('ITokenService') private readonly tokenService: ITokenService,
        @inject('IUserRepository') private readonly userRepository: IUserRepository
    ) { }

    authenticate(requiredRole?: string) {

        return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
                        buildResponse(false, "Authorization header missing or malformed", undefined, "Something went wrong")
                    )
                }

                const token = authHeader.split(' ')[1];

                if (await this.tokenService.isBlacklisted(token)) {
                    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
                        buildResponse(false, "Token has been revoked", undefined, "Something went wrong")
                    );
                }

                const payload = this.tokenService.verifyAccessToken(token) as JwtPayload | null;

                if (!payload) {
                    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
                        buildResponse(false, "Invalid or expired token", undefined, "Something went wrong")
                    );
                }

                const user = await this.userRepository.findById(payload.userId);
                if (user && user.isBlocked) {
                    return res.status(HTTP_STATUS.FORBIDDEN).json(
                        buildResponse(false, "Your account has been blocked. Please contact support.", undefined, "Account blocked")
                    );
                }

                if (requiredRole && payload.role !== requiredRole) {
                    return res.status(HTTP_STATUS.FORBIDDEN).json(
                        buildResponse(false, "Insufficient permissions", undefined, "Something went wrong")
                    );
                }

                req.user = payload;
                
                next();

            } catch (error: any) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
                    buildResponse(false, error.message || 'Internal server error', undefined, "Something went wrong")
                );
            }
        };
    }
}
