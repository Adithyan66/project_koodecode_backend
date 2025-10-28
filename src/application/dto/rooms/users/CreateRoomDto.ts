
export interface CreateRoomDto {
  name: string;
  description: string;
  isPrivate: boolean;
  password?: string;
  scheduledTime?: string;
  problemNumber?: number;
  thumbnail?: string;
  
  maxParticipants?: number;
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  config?: {
    allowGuestJoins?: boolean;
    autoStart?: boolean;
    showLeaderboard?: boolean;
    recordSession?: boolean;
    maxCodeLength?: number;
    allowedLanguages?: number[];
    enableChat?: boolean;
    enableVoice?: boolean;
    enableVideo?: boolean;
  };
}

export interface CreateRoomResponseDto {
  success: boolean;
  room?: {
    id: string;
    roomNumber: number;
    roomId: string;
    name: string;
    description: string;
    isPrivate: boolean;
    scheduledTime?: Date;
    problemNumber?: number;
    thumbnail?: string;
    status: string;
    jitsiUrl: string;
  };
  error?: string;
}
