

import { UserConnection, ConnectionStatus } from '../../domain/entities/UserConnection';
import { IUserConnectionRepository } from '../..***REMOVED***epository';
import { UserConnectionModel } from './models/UserConnectionModel';
import { Types } from 'mongoose';

export class MongoUserConnectionRepository implements IUserConnectionRepository {
    async create(connection: UserConnection): Promise<UserConnection> {
        const newConnection = new UserConnectionModel({
            followerId: new Types.ObjectId(connection.followerId),
            followingId: new Types.ObjectId(connection.followingId),
            status: connection.status
        });

        const saved = await newConnection.save();
        connection.id = saved._id.toString();
        connection.createdAt = saved.createdAt;
        
        return connection;
    }

    async findByFollower(followerId: string, status?: ConnectionStatus): Promise<UserConnection[]> {
        const query: any = { followerId: new Types.ObjectId(followerId) };
        if (status) query.status = status;

        const connections = await UserConnectionModel.find(query);
            
        return connections.map(conn => new UserConnection(
            conn.followerId.toString(),
            conn.followingId.toString(),
            conn.status as ConnectionStatus,
            conn.createdAt,
            conn._id.toString()
        ));
    }

    async findByFollowing(followingId: string, status?: ConnectionStatus): Promise<UserConnection[]> {
        const query: any = { followingId: new Types.ObjectId(followingId) };
        if (status) query.status = status;

        const connections = await UserConnectionModel.find(query);
            
        return connections.map(conn => new UserConnection(
            conn.followerId.toString(),
            conn.followingId.toString(),
            conn.status as ConnectionStatus,
            conn.createdAt,
            conn._id.toString()
        ));
    }

    async findConnection(followerId: string, followingId: string): Promise<UserConnection | null> {
        const connection = await UserConnectionModel.findOne({
            followerId: new Types.ObjectId(followerId),
            followingId: new Types.ObjectId(followingId)
        });

        if (!connection) return null;

        return new UserConnection(
            connection.followerId.toString(),
            connection.followingId.toString(),
            connection.status as ConnectionStatus,
            connection.createdAt,
            connection._id.toString()
        );
    }

    async updateStatus(followerId: string, followingId: string, status: ConnectionStatus): Promise<boolean> {
        const result = await UserConnectionModel.updateOne(
            {
                followerId: new Types.ObjectId(followerId),
                followingId: new Types.ObjectId(followingId)
            },
            { status }
        );

        return result.modifiedCount > 0;
    }

    async delete(followerId: string, followingId: string): Promise<boolean> {
        const result = await UserConnectionModel.deleteOne({
            followerId: new Types.ObjectId(followerId),
            followingId: new Types.ObjectId(followingId)
        });

        return result.deletedCount > 0;
    }

    async getFollowersCount(userId: string): Promise<number> {
        return await UserConnectionModel.countDocuments({
            followingId: new Types.ObjectId(userId),
            status: ConnectionStatus.ACTIVE
        });
    }

    async getFollowingCount(userId: string): Promise<number> {
        return await UserConnectionModel.countDocuments({
            followerId: new Types.ObjectId(userId),
            status: ConnectionStatus.ACTIVE
        });
    }
}
