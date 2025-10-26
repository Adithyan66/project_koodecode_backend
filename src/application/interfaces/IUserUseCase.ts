import { GetAllUsersRequestDto } from '../dto/users/admin/GetAllUsersRequestDto';
import { GetAllUsersResponseDto } from '../dto/users/admin/GetAllUsersResponseDto';
import { GetUserProfileResponseDto } from '../dto/users/admin/GetUserProfileResponseDto';

export interface IGetAllUsersUseCase {
  execute(request: GetAllUsersRequestDto): Promise<GetAllUsersResponseDto>;
}

export interface IGetUserProfileUseCase {
  execute(userId: string): Promise<GetUserProfileResponseDto>;
}

export interface IBlockUserUseCase {
  execute(userId: string, adminId: string, isBlocked: boolean): Promise<{ success: boolean; message: string }>;
}
