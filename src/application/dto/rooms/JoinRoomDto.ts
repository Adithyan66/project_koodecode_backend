

export interface JoinRoomDto {
  roomId: string;
  password?: string;
}

export interface JoinRoomResponseDto {
  success: boolean;
  room?: {
    id: string;
    roomId: string;
    name: string;
    description: string;
    problem?: any;
    participants: any[];
    userPermissions: any;
    jitsiUrl: string;
    socketToken: string;
  };
  error?: string;
}
