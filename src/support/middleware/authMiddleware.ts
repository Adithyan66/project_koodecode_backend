


import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/services/JwtService'; 
import { HTTP_STATUS } from '../../shared/constants/httpStatus';

const jwtService = new JwtService();

interface JwtPayload {
    userId: string;
    role: string;
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
            
            if (requiredRole && payload.role !== requiredRole) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'Insufficient permissions',
                });
            }
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
