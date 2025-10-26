export interface AdminUserDto {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  profilePicKey?: string;
  createdAt: string;
  updatedAt: string;
  provider: 'email' | 'google' | 'github';
  emailVerified: boolean;
  isBlocked: boolean;
}

export interface GetAllUsersResponseDto {
  users: AdminUserDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
