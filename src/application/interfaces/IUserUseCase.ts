import { GetAllUsersRequestDto } from '../dto/users/admin/GetAllUsersRequestDto';
import { GetAllUsersResponseDto } from '../dto/users/admin/GetAllUsersResponseDto';
import { GetUserProfileResponseDto } from '../dto/users/admin/GetUserProfileResponseDto';
import { UserDetailDto } from '../dto/users/admin/UserDetailDto';
import { UserContestDataDto } from '../dto/users/admin/UserContestDataDto';

export interface IGetAllUsersUseCase {
  execute(request: GetAllUsersRequestDto): Promise<GetAllUsersResponseDto>;
}

export interface IGetUserDetailForAdminUseCase {
  execute(userId: string): Promise<GetUserProfileResponseDto>;
}


export interface IGetUserDetailForAdminUseCase {
  execute(userId: string): Promise<UserDetailDto>;
}
export interface IBlockUserUseCase {
  execute(userId: string, adminId: string, isBlocked: boolean): Promise<{ success: boolean; message: string }>;

}

export interface IGetUserContestDataUseCase {
  execute(userId: string, page: number, limit: number): Promise<UserContestDataDto>;
}
