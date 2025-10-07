import { Room, RoomCode } from '../../entities/Room';

export interface IRoomRepository {
  create(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room>;
  findById(id: string): Promise<Room | null>;
  findByRoomId(roomId: string): Promise<Room | null>;
  findByRoomNumber(roomNumber: number): Promise<Room | null>;
  // findPublicRooms(limit?: number): Promise<Room[]>;
  findByCreator(userId: string): Promise<Room[]>;
  findActiveRooms(): Promise<Room[]>;
  update(id: string, updates: Partial<Room>): Promise<Room | null>;
  delete(id: string): Promise<void>;
   findPublicRooms(params: {
        status?: 'active' | 'waiting';
        page: number;
        limit: number;
        search?: string;
    }): Promise<{
        rooms: Room[];
        total: number;
        page: number;
        totalPages: number;
    }>;
  
  // Participant management
  addParticipant(roomId: string, participant: any): Promise<void>;
  removeParticipant(roomId: string, userId: string): Promise<void>;
  updateParticipantStatus(roomId: string, userId: string, isOnline: boolean): Promise<void>;
  
  // Permissions
  updatePermissions(roomId: string, permissions: any): Promise<void>;
  
  // Room code management
  saveRoomCode(roomCode: RoomCode): Promise<void>;
  getRoomCode(roomId: string): Promise<RoomCode | null>;
}
