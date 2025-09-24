
export interface RoomListDto {
  id: string;
  roomNumber: number;
  roomId: string;
  name: string;
  description: string;
  thumbnail?: string;
  creatorName: string;
  participantCount: number;
  isActive: boolean;
  problemTitle?: string;
  createdAt: Date;
}

export interface RoomListResponseDto {
  success: boolean;
  rooms: RoomListDto[];
  total: number;
}
