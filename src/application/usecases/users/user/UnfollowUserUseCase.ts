

import { IUserConnectionRepository } from '../../interfaces/IUserConnectionRepository';
import { FollowUserResponseDto } from '../../../dto/users/FollowUserDto';

export class UnfollowUserUseCase {
    constructor(
        private connectionRepository: IUserConnectionRepository
    ) {}

    async execute(followerId: string, followingId: string): Promise<FollowUserResponseDto> {
        if (followerId === followingId) {
            return {
                success: false,
                message: 'Cannot unfollow yourself',
                isFollowing: false
            };
        }

        const existingConnection = await this.connectionRepository.findConnection(followerId, followingId);
        
        if (!existingConnection) {
            return {
                success: false,
                message: 'Not following this user',
                isFollowing: false
            };
        }

        await this.connectionRepository.delete(followerId, followingId);
        
        return {
            success: true,
            message: 'Successfully unfollowed user',
            isFollowing: false
        };
    }
}
