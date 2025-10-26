import { GetAllUsersRequestDto } from '../dto/users/admin/GetAllUsersRequestDto';
import { GetAllUsersResponseDto } from '../dto/users/admin/GetAllUsersResponseDto';
import { GetUserProfileResponseDto } from '../dto/users/admin/GetUserProfileResponseDto';

export interface IGetAllUsersUseCase {
  execute(request: GetAllUsersRequestDto): Promise<GetAllUsersResponseDto>;
}

export interface IGetUserProfileUseCase {
  execute(userId: string): Promise<GetUserProfileResponseDto>;
}
