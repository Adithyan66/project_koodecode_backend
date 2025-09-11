

import { Request, Response } from 'express';
import { FollowUserUseCase } from '../../../application/usecases/users/FollowUserUseCase';
import { UnfollowUserUseCase } from '../../../application/usecases/users/UnfollowUserUseCase';
import { GetUserFollowersUseCase } from '../../../application/usecases/users/GetUserFollowersUseCase';
import { GetUserFollowingUseCase } from '../../../application/usecases/users/GetUserFollowingUseCase';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';

interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        role: string;
    }
}

export class UserSocialController {
    constructor(
        private followUserUseCase: FollowUserUseCase,
        private unfollowUserUseCase: UnfollowUserUseCase,
        private getUserFollowersUseCase: GetUserFollowersUseCase,
        private getUserFollowingUseCase: GetUserFollowingUseCase
    ) { }

    async followUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const followerId = req.user?.userId;
            const { targetUserId } = req.body;

            if (!followerId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            if (!targetUserId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Target user ID is required'
                });
                return;
            }

            const result = await this.followUserUseCase.execute(followerId, targetUserId);

            res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST).json(result);
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to follow user'
            });
        }
    }

    async unfollowUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const followerId = req.user?.userId;
            const { targetUserId } = req.body;

            if (!followerId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            if (!targetUserId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Target user ID is required'
                });
                return;
            }

            const result = await this.unfollowUserUseCase.execute(followerId, targetUserId);

            res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST).json(result);
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to unfollow user'
            });
        }
    }

    async getFollowers(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.params.userId || req.user?.userId;

            if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const followers = await this.getUserFollowersUseCase.execute(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: followers
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to get followers'
            });
        }
    }

    async getFollowing(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.params.userId || req.user?.userId;

            if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const following = await this.getUserFollowingUseCase.execute(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: following
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to get following'
            });
        }
    }
}
