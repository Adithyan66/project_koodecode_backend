




import { CreateRoomDto, CreateRoomResponseDto } from "../dto/rooms/CreateRoomDto";
import { JoinRoomDto, JoinRoomResponseDto, VerifyPrivateRoomDto, VerifyPrivateRoomResponseDto } from "../dto/rooms/JoinRoomDto";
import { PublicRoomsResponseDto } from "../dto/rooms/PublicRoomsDto";
import { KickUserDto, UpdateRoomPermissionsDto } from "../dto/rooms/UpdateRoomPermissionsDto";

export interface ICreateRoomUseCase {
    execute(createRoomDto: CreateRoomDto, userId: string): Promise<CreateRoomResponseDto>;
}


export interface IJoinRoomUseCase {
  execute(joinRoomDto: JoinRoomDto, userId: string): Promise<JoinRoomResponseDto>;
}

export interface IGetPublicRoomsUseCase {
    execute(params: {
        status?: 'active' | 'waiting';
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<PublicRoomsResponseDto>;
}

export interface IUpdateRoomPermissionsUseCase {
  execute(
    roomId: string,
    requesterId: string,
    updateDto: UpdateRoomPermissionsDto
  ): Promise<{ success: boolean; error?: string }>;
}

export interface IKickUserUseCase {
  execute(
    roomId: string,
    requesterId: string,
    kickDto: KickUserDto
  ): Promise<{ success: boolean; error?: string }>;
}

export interface IVerifyPrivateRoomUseCase {
  execute(dto: VerifyPrivateRoomDto): Promise<VerifyPrivateRoomResponseDto>;
}