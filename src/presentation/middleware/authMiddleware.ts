// // src/middleware/authMiddleware.ts
// import { Request, Response, NextFunction } from 'express';
// import { ValidateUserUseCase } from '../usecases/ValidateUserUseCase';

// export interface AuthenticatedRequest extends Request {
//     user?: {
//         fullName: string;
//         userName: string;
//         email: string;
//         isAdmin: boolean;
//         profilePicUrl?: string;
//     };
// }

// export class AuthMiddleware {
//     constructor(
//         private readonly validateUserUseCase: ValidateUserUseCase
//     ) {}

//     authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
//         try {
//             const authHeader = req.headers.authorization;

//             if (!authHeader) {
//                 res.status(401).json({
//                     success: false,
//                     message: 'Authorization header is required'
//                 });
//                 return;
//             }

//             const token = authHeader.startsWith('Bearer ') 
//                 ? authHeader.substring(7) 
//                 : authHeader;

//             const result = await this.validateUserUseCase.execute(token);

//             if (!result.success) {
//                 res.status(401).json({
//                     success: false,
//                     message: result.message
//                 });
//                 return;
//             }

//             // Attach user to request for use in protected routes
//             req.user = result.user;
//             next();

//         } catch (error) {
//             console.error('AuthMiddleware error:', error);
//             res.status(500).json({
//                 success: false,
//                 message: 'Authentication failed'
//             });
//         }
//     };

//     // Middleware to check if user is admin
//     requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
//         if (!req.user?.isAdmin) {
//             res.status(403).json({
//                 success: false,
//                 message: 'Admin access required'
//             });
//             return;
//         }
//         next();
//     };
// }




import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/services/JwtService'; 
import { HTTP_STATUS } from '../../shared/constants/httpStatus';

const jwtService = new JwtService();

interface JwtPayload {
    id: string;
    role: string;
    // add other expected JWT payload fields here
}

interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export function authMiddleware(requiredRole?: string) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Authorization header missing or malformed',
                });
            }

            const token = authHeader.split(' ')[1];
            
            // Check if token is blacklisted
            if (await jwtService.isBlacklisted(token)) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Token has been revoked',
                });
            }

            // Verify token
            const payload = jwtService.verifyAccessToken(token) as JwtPayload | null;
            if (!payload) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid or expired token',
                });
            }

            // Check required role if specified
            if (requiredRole && payload.role !== requiredRole) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'Insufficient permissions',
                });
            }

            // Attach user info to request object
            req.user = payload;
            next();
            
        } catch (error: any) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Internal server error',
            });
        }
    };
}
