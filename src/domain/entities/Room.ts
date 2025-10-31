export interface RoomConfig {
  allowGuestJoins?: boolean;
  autoStart?: boolean;
  showLeaderboard?: boolean;
  recordSession?: boolean;
  maxCodeLength?: number;
  allowedLanguages?: number[];
  enableChat?: boolean;
  enableVoice?: boolean;
  enableVideo?: boolean;
  [key: string]: any;
}

export interface Room {
  _id: string | undefined;
  id: string;
  roomNumber: number;
  roomId: string; 
  name: string;
  description: string;
  thumbnail?: string;
  createdBy: string;
  isPrivate: boolean;
  password?: string;
  scheduledTime?: Date;
  
  maxParticipants?: number;
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  config?: RoomConfig;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  
  problemNumber?: number;
  status: 'waiting' | 'active' | 'inactive';
  participants: Participant[];
  permissions: RoomPermissions;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  profilePicUrl: null;
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
