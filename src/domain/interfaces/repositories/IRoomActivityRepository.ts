import { RoomActivity } from '../../entities/RoomActivity';

export interface IRoomActivityRepository {
  create(activity: Omit<RoomActivity, 'id'>): Promise<RoomActivity>;
  findByRoomId(roomId: string, limit?: number): Promise<RoomActivity[]>;
  findByUserId(userId: string, limit?: number): Promise<RoomActivity[]>;
}
