

import { IUserConnectionRepository } from '../../interfaces/IUserConnectionRepository';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { ConnectionStatus } from '../../../../domain/entities/UserConnection';
import { UserFollowingResponseDto } from '../../../dto/users/FollowUserDto';

export class GetUserFollowingUseCase {
    constructor(
        private connectionRepository: IUserConnectionRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(userId: string): Promise<UserFollowingResponseDto> {
        const connections = await this.connectionRepository.findByFollower(userId, ConnectionStatus.ACTIVE);
        
        const following = await Promise.all(
            connections.map(async (conn) => {
                const user = await this.userRepository.findById(conn.followingId);
                return {
                    userId: conn.followingId,
                    userName: user?.userName || '',
                    fullName: user?.fullName || '',
                    profilePicUrl: user?.profilePicUrl,
                    followedAt: conn.createdAt.toISOString()
                };
            })
        );

        return {
            following,
            followingCount: following.length
        };
    }
}
