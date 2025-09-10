

import { Request, Response } from 'express';
import { GenerateProfileImageUploadUrlUseCase } from '../../..***REMOVED***ileImageUploadUrlUseCase';
import { UpdateProfileImageUseCase } from '../../..***REMOVED***eImageUseCase';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    }
}



export class ProfileImageController {
    constructor(
        private generateUploadUrlUseCase: GenerateProfileImageUploadUrlUseCase,
        private updateProfileImageUseCase: UpdateProfileImageUseCase
    ) { }

    generateUploadUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        
        try {

            const userId = req.user?.userId

             if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'userId is required'
                });
                return;
            }

            const { fileExtension } = req.body;

            if (!fileExtension) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'File extension is required'
                });
                return;
            }

            const result = await this.generateUploadUrlUseCase.execute(userId, { fileExtension });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to generate upload URL'
            });
        }
    };

    confirmUpload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {

        try {

            const userId = req.user?.userId;

            if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'userId is required'
                });
                return;
            }

            const { imageKey, publicUrl } = req.body;

            if (!imageKey || !publicUrl) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Image key and public URL are required'
                });
                return;
            }

            await this.updateProfileImageUseCase.execute(userId, imageKey, publicUrl);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Profile image updated successfully'
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update profile image'
            });
        }
    };
}
