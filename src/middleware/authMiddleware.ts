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
