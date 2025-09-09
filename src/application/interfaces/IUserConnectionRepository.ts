import { UserConnection, ConnectionStatus } from '../../domain/entities/UserConnection';

export interface IUserConnectionRepository {
    create(connection: UserConnection): Promise<UserConnection>;
    findByFollower(followerId: string, status?: ConnectionStatus): Promise<UserConnection[]>;
    findByFollowing(followingId: string, status?: ConnectionStatus): Promise<UserConnection[]>;
    findConnection(followerId: string, followingId: string): Promise<UserConnection | null>;
    updateStatus(followerId: string, followingId: string, status: ConnectionStatus): Promise<boolean>;
    delete(followerId: string, followingId: string): Promise<boolean>;
    getFollowersCount(userId: string): Promise<number>;
    getFollowingCount(userId: string): Promise<number>;
}
