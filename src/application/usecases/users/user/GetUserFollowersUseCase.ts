

import { IUserConnectionRepository } from '../../interfaces/IUserConnectionRepository';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { ConnectionStatus } from '../../../domain/entities/UserConnection';
import { UserFollowersResponseDto } from '../../dto/users/FollowUserDto';

export class GetUserFollowersUseCase {
    constructor(
        private connectionRepository: IUserConnectionRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(userId: string): Promise<UserFollowersResponseDto> {
        const connections = await this.connectionRepository.findByFollowing(userId, ConnectionStatus.ACTIVE);
        
        const followers = await Promise.all(
            connections.map(async (conn) => {
                const user = await this.userRepository.findById(conn.followerId);
                return {
                    userId: conn.followerId,
                    userName: user?.userName || '',
                    fullName: user?.fullName || '',
                    profilePicUrl: user?.profilePicUrl,
                    followedAt: conn.createdAt.toISOString()
                };
            })
        );

        return {
            followers,
            followersCount: followers.length
        };
    }
}
