

import { Request, Response } from 'express';
<<<<<<< HEAD
import { GetUserProfileUseCase } from '../../../application/usecases/users/GetUserProfileUseCase'; 
import { UpdateUserProfileUseCase } from '../../../application/usecases/users/UpdateUserProfileUseCase'; 
=======
import { GetUserProfileUseCase } from '../../../application/usecases/users/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../../../application/usecases/users/UpdateUserProfileUseCase';
>>>>>>> feature/s3-bucket
import { UpdateProfileDto } from '../../../application/dto/users/UserProfileDto';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import { IUserRepository } from '../../../application/interfaces/IUserRepository';
import { GetUserEditableProfile } from '../../../application/usecases/users/GetUserEditableProfile';


interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    }
}


export class UserProfileController {

    constructor(
        private getUserProfileUseCase: GetUserProfileUseCase,
        private updateUserProfileUseCase: UpdateUserProfileUseCase,
        private getUserEditableProfile: GetUserEditableProfile,
        private userRepository: IUserRepository
    ) { }

    async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {

        try {
            const userId = req.user?.userId;
            const targetUserId = req.params.userId || userId;
            const year = parseInt(req.query.year as string) || new Date().getFullYear();

            if (!targetUserId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const profile = await this.getUserProfileUseCase.execute(targetUserId, year);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: profile
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to get user profile'
            });
        }
    }

    async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {

        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const updateData: UpdateProfileDto = req.body;

            const updatedProfile = await this.updateUserProfileUseCase.execute(userId, updateData);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedProfile
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Failed to update profile'
            });
        }
    }

    async getPublicProfile(req: Request, res: Response): Promise<void> {
        try {
            const { username } = req.params;
            const year = parseInt(req.query.year as string) || new Date().getFullYear();

            const user = await this.userRepository.findByUsername(username);
            if (!user) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            const profile = await this.getUserProfileUseCase.execute(user.id!, year);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: profile
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to get public profile'
            });
        }
    }

    async getEditProfile(req: AuthenticatedRequest, res: Response) {

        try {

            let userId = req.user?.userId

            if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            let result = await this.getUserEditableProfile.execute(userId)

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            })

        } catch (error) {

        }
    }
}
