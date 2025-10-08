

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
    createdBy: string;
    description: string;
    problem?: any;
    sampleTestCases?: any;
    participants: any[];
    userPermissions: any;
    jitsiUrl: string;
    socketToken: string;
  };
  error?: string;
}


export interface VerifyPrivateRoomDto {
  roomName: string;
  password: string;
}

export interface VerifyPrivateRoomResponseDto {
  success: boolean;
  roomId?: string;
  error?: string;
}