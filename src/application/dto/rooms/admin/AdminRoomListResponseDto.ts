export interface AdminRoomDto {
  id: string;
  roomNumber: number;
  roomId: string;
  name: string;
  createdBy: string;
  createdByUsername: string;
  isPrivate: boolean;
  status: 'waiting' | 'active' | 'inactive';
  participantCount: number;
  onlineParticipants: number;
  lastActivity: Date;
  createdAt: Date;
  thumbnail?: string;
}

export interface AdminRoomListResponseDto {
  rooms: AdminRoomDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

