export interface AdminRoomListRequestDto {
  page: number;
  limit: number;
  search?: string;
  isPrivate?: boolean;
  status?: 'waiting' | 'active' | 'inactive';
  sortBy?: 'createdAt' | 'lastActivity' | 'roomNumber';
  sortOrder?: 'asc' | 'desc';
}

