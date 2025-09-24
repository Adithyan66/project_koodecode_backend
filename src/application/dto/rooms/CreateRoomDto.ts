
export interface CreateRoomDto {
  name: string;
  description: string;
  isPrivate: boolean;
  password?: string;
  scheduledTime?: string;
  problemNumber?: number;
  thumbnail?: string;
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
