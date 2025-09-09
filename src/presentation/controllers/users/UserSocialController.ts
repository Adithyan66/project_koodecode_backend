

import { Request, Response } from 'express';
import { FollowUserUseCase } from '../../../application/usecases/users/FollowUserUseCase';
import { UnfollowUserUseCase } from '../../../application/usecases/users/UnfollowUserUseCase';
import { GetUserFollowersUseCase } from '../../../application/usecases/users/GetUserFollowersUseCase';
import { GetUserFollowingUseCase } from '../../../application/usecases/users/GetUserFollowingUseCase';
import { HttpStatus } from '../../../shared/constants/httpStatus';

export class UserSocialController {
    constructor(
        private followUserUseCase: FollowUserUseCase,
        private unfollowUserUseCase: UnfollowUserUseCase,
        private getUserFollowersUseCase: GetUserFollowersUseCase,
        private getUserFollowingUseCase: GetUserFollowingUseCase
    ) {}

    async followUser(req: Request, res: Response): Promise<void> {
        try {
            const followerId = req.user?.id;
            const { targetUserId } = req.body;
            
            if (!followerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            if (!targetUserId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Target user ID is required'
                });
                return;
            }

            const result = await this.followUserUseCase.execute(followerId, targetUserId);

            res.status(result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST).json(result);
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to follow user'
            });
        }
    }

    async unfollowUser(req: Request, res: Response): Promise<void> {
        try {
            const followerId = req.user?.id;
            const { targetUserId } = req.body;
            
            if (!followerId) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            if (!targetUserId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Target user ID is required'
                });
                return;
            }

            const result = await this.unfollowUserUseCase.execute(followerId, targetUserId);

            res.status(result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST).json(result);
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to unfollow user'
            });
        }
    }

    async getFollowers(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId || req.user?.id;
            
            if (!userId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const followers = await this.getUserFollowersUseCase.execute(userId);

            res.status(HttpStatus.OK).json({
                success: true,
                data: followers
            });
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to get followers'
            });
        }
    }

    async getFollowing(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId || req.user?.id;
            
            if (!userId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const following = await this.getUserFollowingUseCase.execute(userId);

            res.status(HttpStatus.OK).json({
                success: true,
                data: following
            });
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to get following'
            });
        }
    }
}
