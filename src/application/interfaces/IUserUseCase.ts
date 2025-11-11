import { GetAllUsersRequestDto } from '../dto/users/admin/GetAllUsersRequestDto';
import { GetAllUsersResponseDto } from '../dto/users/admin/GetAllUsersResponseDto';
import { GetUserProfileResponseDto } from '../dto/users/admin/GetUserProfileResponseDto';
import { UserDetailDto } from '../dto/users/admin/UserDetailDto';
import { UserContestDataDto } from '../dto/users/admin/UserContestDataDto';
import { UserSubmissionDataDto } from '../dto/users/admin/UserSubmissionDataDto';
import { UserFinancialDataDto } from '../dto/users/admin/UserFinancialDataDto';
import { UserStoreDataDto } from '../dto/users/admin/UserStoreDataDto';
import { UserRoomDataDto } from '../dto/users/admin/UserRoomDataDto';
import { ResetPasswordResponseDto } from '../dto/users/admin/ResetPasswordResponseDto';
import { SendMailRequestDto, SendMailResponseDto } from '../dto/users/admin/SendMailDto';

export interface IGetAllUsersUseCase {
  execute(request: GetAllUsersRequestDto): Promise<GetAllUsersResponseDto>;
}

export interface IGetUserProfileForAdminUseCase {
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

export interface IGetUserSubmissionDataUseCase {
  execute(userId: string, page: number, limit: number): Promise<UserSubmissionDataDto>;
}

export interface IGetUserFinancialDataUseCase {
  execute(userId: string, coinPage: number, coinLimit: number, paymentPage: number, paymentLimit: number): Promise<UserFinancialDataDto>;
}

export interface IGetUserStoreDataUseCase {
  execute(userId: string): Promise<UserStoreDataDto>;
}

export interface IGetUserRoomDataUseCase {
  execute(userId: string, page: number, limit: number): Promise<UserRoomDataDto>;
}

export interface IResetUserPasswordUseCase {
  execute(userId: string): Promise<ResetPasswordResponseDto>;
}

export interface ISendMailToUserUseCase {
  execute(userId: string, mailData: SendMailRequestDto): Promise<SendMailResponseDto>;
}
