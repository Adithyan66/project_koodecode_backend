

import { IUserConnectionRepository } from '../../../domain/interfaces/repositories/IUserConnectionRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { UserConnection, ConnectionStatus } from '../../../domain/entities/UserConnection';
import { FollowUserResponseDto } from '../../dto/users/FollowUserDto';

export class FollowUserUseCase {
    constructor(
        private connectionRepository: IUserConnectionRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(followerId: string, followingId: string): Promise<FollowUserResponseDto> {
        if (followerId === followingId) {
            return {
                success: false,
                message: 'Cannot follow yourself',
                isFollowing: false
            };
        }

        // Check if users exist
        const [follower, following] = await Promise.all([
            this.userRepository.findById(followerId),
            this.userRepository.findById(followingId)
        ]);

        if (!follower || !following) {
            return {
                success: false,
                message: 'User not found',
                isFollowing: false
            };
        }

        // Check if connection already exists
        const existingConnection = await this.connectionRepository.findConnection(followerId, followingId);
        
        if (existingConnection) {
            if (existingConnection.status === ConnectionStatus.ACTIVE) {
                return {
                    success: false,
                    message: 'Already following this user',
                    isFollowing: true
                };
            } else {
                // Reactivate connection
                await this.connectionRepository.updateStatus(followerId, followingId, ConnectionStatus.ACTIVE);
                return {
                    success: true,
                    message: 'Successfully followed user',
                    isFollowing: true
                };
            }
        }

        // Create new connection
        const connection = new UserConnection(followerId, followingId, ConnectionStatus.ACTIVE);
        await this.connectionRepository.create(connection);
        
        return {
            success: true,
            message: 'Successfully followed user',
            isFollowing: true
        };
    }
}
