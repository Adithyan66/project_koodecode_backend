import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../../errors/AppErrors';

export interface IBlockUserUseCase {
  execute(userId: string, adminId: string, isBlocked: boolean): Promise<{ success: boolean; message: string }>;
}

@injectable()
export class BlockUserUseCase implements IBlockUserUseCase {
  
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async execute(userId: string, adminId: string, isBlocked: boolean): Promise<{ success: boolean; message: string }> {
    try {

      if (!adminId || adminId.trim().length === 0) {
        throw new BadRequestError("Admin ID is required");
      }

      if (!userId || userId.trim().length === 0) {
        throw new BadRequestError("User ID is required");
      }

      const admin = await this.userRepository.findById(adminId);
      if (!admin) {
        throw new NotFoundError("Admin not found");
      }
      if (admin.role !== 'admin') {
        throw new UnauthorizedError("Only admins can block/unblock users");
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      if (userId === adminId) {
        throw new BadRequestError("Cannot block/unblock yourself");
      }

      if (user.role === 'admin') {
        throw new BadRequestError("Cannot block/unblock other admins");
      }

      const updatedUser = await this.userRepository.blockUser(userId, isBlocked);
      if (!updatedUser) {
        throw new BadRequestError("Failed to update user status");
      }

      const action = isBlocked ? 'blocked' : 'unblocked';
      return {
        success: true,
        message: `User ${action} successfully`
      };

    } catch (error) {
      if (error instanceof BadRequestError || 
          error instanceof NotFoundError ||
          error instanceof UnauthorizedError) {
        throw error;
      }

      throw new BadRequestError("An unexpected error occurred while updating user status");
    }
  }
}