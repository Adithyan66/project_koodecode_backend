import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { GetAllUsersRequestDto } from '../../../dto/users/admin/GetAllUsersRequestDto';
import { GetAllUsersResponseDto, AdminUserDto } from '../../../dto/users/admin/GetAllUsersResponseDto';
import { IGetAllUsersUseCase } from '../../../interfaces/IUserUseCase';

@injectable()
export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async execute(request: GetAllUsersRequestDto): Promise<GetAllUsersResponseDto> {
    const { users, total } = await this.userRepository.findAllUsersWithPagination({
      page: request.page,
      limit: request.limit,
      search: request.search
    });

    const totalPages = Math.ceil(total / request.limit);

    const adminUsers: AdminUserDto[] = users.map(user => ({
      id: user.id!,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      profilePicUrl: user.profilePicUrl,
      profilePicKey: user.profilePicKey,
      createdAt: user.createdAt!.toISOString(),
      updatedAt: user.updatedAt!.toISOString(),
      provider: user.provider,
      emailVerified: user.emailVerified,
      isBlocked: user.isBlocked
    }));

    return {
      users: adminUsers,
      pagination: {
        total,
        page: request.page,
        limit: request.limit,
        totalPages
      }
    };
  }
}
