
import { Request, Response } from 'express';
import { ValidateUserUseCase } from '../../../application/usecases/users/ValidateUserUseCase';

export class UserController {

    constructor(
        private readonly validateUserUseCase: ValidateUserUseCase
    ) { }


    async validateUser(req: Request, res: Response): Promise<void> {

        try {

            const authHeader = req.headers.authorization;

            
            if (!authHeader) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization header is required'
                });
                return;
            }
            
            const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;
            
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: 'Token is required'
                });
                return;
            }
            
            
            const result = await this.validateUserUseCase.execute(token);
            
            if (!result.success) {
                res.status(401).json({
                    success: false,
                    message: result.message
                });
                return;
            }
            
            res.status(200).json({
                success: true,
                message: result.message,
                user: result.user
            });

        } catch (error) {
            console.error('UserController validateUser error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
