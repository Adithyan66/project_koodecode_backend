import { IRoomActivityRepository } from '../../domain/interfaces/repositories/IRoomActivityRepository';
import { RoomActivity } from '../../domain/entities/RoomActivity';
import { RoomActivityModel, RoomActivityDocument } from './models/RoomActivityModel';

export class MongoRoomActivityRepository implements IRoomActivityRepository {
    
  async create(activity: Omit<RoomActivity, 'id'>): Promise<RoomActivity> {
    const activityDoc = new RoomActivityModel(activity);
    const savedActivity = await activityDoc.save();
    return this.mapToRoomActivity(savedActivity);
  }

  async findByRoomId(roomId: string, limit: number = 50): Promise<RoomActivity[]> {
    const activities = await RoomActivityModel.find({ roomId })
      .populate('userId', 'username')
      .sort({ timestamp: -1 })
      .limit(limit);

    return activities.map(activity => this.mapToRoomActivity(activity));
  }

  async findByUserId(userId: string, limit: number = 50): Promise<RoomActivity[]> {
    const activities = await RoomActivityModel.find({ userId })
      .populate('userId', 'username')
      .sort({ timestamp: -1 })
      .limit(limit);

    return activities.map(activity => this.mapToRoomActivity(activity));
  }

  private mapToRoomActivity(activityDoc: RoomActivityDocument): RoomActivity {
    return {
      id: activityDoc._id.toString(),
      roomId: activityDoc.roomId,
      userId: activityDoc.userId.toString(),
      action: activityDoc.action,
      details: activityDoc.details,
      timestamp: activityDoc.timestamp
    };
  }
}
