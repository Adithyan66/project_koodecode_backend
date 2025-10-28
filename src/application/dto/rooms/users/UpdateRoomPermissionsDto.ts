
export interface UpdateRoomPermissionsDto {
  userId: string;
  permissions: {
    canEditCode: boolean;
    canDrawWhiteboard: boolean;
    canChangeProblem: boolean;
  };
}

export interface KickUserDto {
  userId: string;
  reason?: string;
}
