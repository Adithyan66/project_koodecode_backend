export interface GetAllUsersRequestDto {
  page: number;
  limit: number;
  search?: string; // search by email or username
}
