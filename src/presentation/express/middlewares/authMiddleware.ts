





// import { Request, Response, NextFunction } from 'express';
// import { JwtService } from '../../infrastructure/services/JwtService'; 
// import { HTTP_STATUS } from '../../shared/constants/httpStatus';

// const jwtService = new JwtService();

// interface JwtPayload {
//     userId: string;
//     role: string;
// }

// interface AuthenticatedRequest extends Request {
//     user?: JwtPayload;
// }

// export function authMiddleware(requiredRole?: string) {

//     return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

//         try {


//             const authHeader = req.headers.authorization;
//             if (!authHeader || !authHeader.startsWith('Bearer ')) {
//                 return res.status(HTTP_STATUS.UNAUTHORIZED).json({
//                     success: false,
//                     message: 'Authorization header missing or malformed',
//                 });
//             }

//             const token = authHeader.split(' ')[1];

//             // Check if token is blacklisted
//             if (await jwtService.isBlacklisted(token)) {
//                 return res.status(HTTP_STATUS.UNAUTHORIZED).json({
//                     success: false,
//                     message: 'Token has been revoked',
//                 });
//             }

//             const payload = jwtService.verifyAccessToken(token) as JwtPayload | null;

//             if (!payload) {
//                 return res.status(HTTP_STATUS.UNAUTHORIZED).json({
//                     success: false,
//                     message: 'Invalid or expired token',
//                 });
//             }

//             if (requiredRole && payload.role !== requiredRole) {
//                 return res.status(HTTP_STATUS.FORBIDDEN).json({
//                     success: false,
//                     message: 'Insufficient permissions',
//                 });
//             }
//             req.user = payload;            
//             next();

//         } catch (error: any) {
//             return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
//                 success: false,
//                 message: error.message || 'Internal server error',
//             });
//         }
//     };
// }



import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import { inject, injectable } from 'tsyringe';
import { buildResponse } from '../../../infrastructure/utils/responseBuilder';

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
        @inject('ITokenService') private readonly tokenService: ITokenService
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
