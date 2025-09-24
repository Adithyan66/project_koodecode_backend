import { IRoomRepository } from '../../domain/interfaces/repositories/IRoomRepository';
import { Room, RoomCode, Participant } from '../../domain/entities/Room';
import { RoomModel, RoomDocument } from './models/RoomModel';
import { RoomCodeModel } from './models/RoomCodeModel';

export class MongoRoomRepository implements IRoomRepository {

  async create(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    const roomDoc = new RoomModel(room);
    const savedRoom = await roomDoc.save();
    return this.mapToRoom(savedRoom);
  }

  async findById(id: string): Promise<Room | null> {
    const room = await RoomModel.findById(id).populate('participants.userId', 'username');
    return room ? this.mapToRoom(room) : null;
  }

  async findByRoomId(roomId: string): Promise<Room | null> {

    const room = await RoomModel.findById(roomId).populate('participants.userId', 'username');
    return room ? this.mapToRoom(room) : null;
  }

  async findByRoomNumber(roomNumber: number): Promise<Room | null> {
    const room = await RoomModel.findOne({ roomNumber }).populate('participants.userId', 'username');
    return room ? this.mapToRoom(room) : null;
  }

  async findPublicRooms(limit: number = 20): Promise<Room[]> {
    const rooms = await RoomModel.find({
      isPrivate: false,
      status: { $in: ['active', 'waiting'] }
    })
      .populate('participants.userId', 'username')
      .sort({ lastActivity: -1 })
      .limit(limit);

    return rooms.map(room => this.mapToRoom(room));
  }

  async findByCreator(userId: string): Promise<Room[]> {
    const rooms = await RoomModel.find({ createdBy: userId })
      .populate('participants.userId', 'username')
      .sort({ createdAt: -1 });

    return rooms.map(room => this.mapToRoom(room));
  }

  async findActiveRooms(): Promise<Room[]> {
    const rooms = await RoomModel.find({
      status: 'active',
      lastActivity: { $gte: new Date(Date.now() - 20 * 60 * 1000) } // Last 20 minutes
    }).populate('participants.userId', 'username');

    return rooms.map(room => this.mapToRoom(room));
  }

  async update(id: string, updates: Partial<Room>): Promise<Room | null> {
    const room = await RoomModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).populate('participants.userId', 'username');

    return room ? this.mapToRoom(room) : null;
  }

  async delete(id: string): Promise<void> {
    await RoomModel.findByIdAndDelete(id);
  }

  async addParticipant(roomId: string, participant: any): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $addToSet: { participants: participant },
        $set: { lastActivity: new Date() }
      }
    );
  }

  async removeParticipant(roomId: string, userId: string): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $pull: { participants: { userId } },
        $set: { lastActivity: new Date() }
      }
    );
  }

  async updateParticipantStatus(roomId: string, userId: string, isOnline: boolean): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId, 'participants.userId': userId },
      {
        $set: {
          'participants.$.isOnline': isOnline,
          lastActivity: new Date()
        }
      }
    );
  }

  async updatePermissions(roomId: string, permissions: any): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $set: {
          permissions,
          lastActivity: new Date()
        }
      }
    );
  }

  async saveRoomCode(roomCode: RoomCode): Promise<void> {
    await RoomCodeModel.findOneAndUpdate(
      { roomId: roomCode.roomId, problemNumber: roomCode.problemNumber },
      roomCode,
      { upsert: true, new: true }
    );
  }

  async getRoomCode(roomId: string): Promise<RoomCode | null> {
    const roomCode = await RoomCodeModel.findOne({ roomId }).sort({ lastModified: -1 });
    return roomCode ? roomCode.toObject() : null;
  }

  private mapToRoom(roomDoc: RoomDocument): Room {
    return {
      id: roomDoc._id.toString(),
      roomNumber: roomDoc.roomNumber,
      roomId: roomDoc.roomId,
      name: roomDoc.name,
      description: roomDoc.description,
      thumbnail: roomDoc.thumbnail,
      createdBy: roomDoc.createdBy.toString(),
      isPrivate: roomDoc.isPrivate,
      password: roomDoc.password,
      scheduledTime: roomDoc.scheduledTime,
      problemNumber: roomDoc.problemNumber,
      status: roomDoc.status,
      participants: roomDoc.participants.map(p => ({
        userId: p.userId.toString(),
        username: p.username,
        joinedAt: p.joinedAt,
        isOnline: p.isOnline,
        permissions: p.permissions
      })),
      permissions: {
        canEditCode: roomDoc.permissions.canEditCode.map(id => id.toString()),
        canDrawWhiteboard: roomDoc.permissions.canDrawWhiteboard.map(id => id.toString()),
        canChangeProblem: roomDoc.permissions.canChangeProblem.map(id => id.toString())
      },
      lastActivity: roomDoc.lastActivity,
      createdAt: roomDoc.createdAt,
      updatedAt: roomDoc.updatedAt
    };
  }
}
