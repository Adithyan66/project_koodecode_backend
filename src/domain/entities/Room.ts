export interface Room {
  id: string;
  roomNumber: number;
  roomId: string; // Unique identifier for Jitsi/Socket
  name: string;
  description: string;
  thumbnail?: string;
  createdBy: string;
  isPrivate: boolean;
  password?: string;
  scheduledTime?: Date;
  problemNumber?: number;
  status: 'waiting' | 'active' | 'inactive';
  participants: Participant[];
  permissions: RoomPermissions;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  userId: string;
  username: string;
  joinedAt: Date;
  isOnline: boolean;
  permissions: UserPermissions;
}

export interface UserPermissions {
  canEditCode: boolean;
  canDrawWhiteboard: boolean;
  canChangeProblem: boolean;
}

export interface RoomPermissions {
  canEditCode: string[];
  canDrawWhiteboard: string[];
  canChangeProblem: string[];
}

export interface RoomCode {
  roomId: string;
  problemNumber: number;
  code: string;
  language: string;
  lastModified: Date;
  lastModifiedBy: string;
}
