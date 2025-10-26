import { GetAllUsersRequestDto } from '../dto/users/admin/GetAllUsersRequestDto';
import { GetAllUsersResponseDto } from '../dto/users/admin/GetAllUsersResponseDto';
import { GetUserProfileResponseDto } from '../dto/users/admin/GetUserProfileResponseDto';
import { UserDetailDto } from '../dto/users/admin/UserDetailDto';

export interface IGetAllUsersUseCase {
  execute(request: GetAllUsersRequestDto): Promise<GetAllUsersResponseDto>;
}

export interface IGetUserDetailForAdminUseCase {
  execute(userId: string): Promise<GetUserProfileResponseDto>;
}

export interface IGetUserDetailForAdminUseCase {
  execute(userId: string): Promise<UserDetailDto>;
}
