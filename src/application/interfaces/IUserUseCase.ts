import { GetAllUsersRequestDto } from '../dto/users/admin/GetAllUsersRequestDto';
import { GetAllUsersResponseDto } from '../dto/users/admin/GetAllUsersResponseDto';

export interface IGetAllUsersUseCase {
  execute(request: GetAllUsersRequestDto): Promise<GetAllUsersResponseDto>;
}
