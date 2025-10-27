export interface UserRoomDataDto {
  roomsJoined: number;
  roomsCreated: number;
  rooms: Array<{
    roomId: string;
    roomName: string;
    role: string;
    joinedAt: string;
  }>;
  roomsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  collaborationStats: {
    totalCollaborations: number;
    successfulCollaborations: number;
    averageSessionDuration: number;
  };
}

