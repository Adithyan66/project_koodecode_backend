import { Request, Response } from 'express';
import { CreateRoomUseCase } from '../../../../application/usecases/rooms/CreateRoomUseCase';
import { JoinRoomUseCase } from '../../../../application/usecases/rooms/JoinRoomUseCase';
import { GetPublicRoomsUseCase } from '../../../../application/usecases/rooms/GetPublicRoomsUseCase';
import { UpdateRoomPermissionsUseCase } from '../../../../application/usecases/rooms/UpdateRoomPermissionsUseCase';
import { KickUserUseCase } from '../../../../application/usecases/rooms/KickUserUseCase';
import { CreateRoomDto } from '../../../../application/dto/rooms/CreateRoomDto';
import { JoinRoomDto } from '../../../../application/dto/rooms/JoinRoomDto';
import { UpdateRoomPermissionsDto, KickUserDto } from '../../../../application/dto/rooms/UpdateRoomPermissionsDto';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';

export class RoomController {
    constructor(
        private createRoomUseCase: CreateRoomUseCase,
        private joinRoomUseCase: JoinRoomUseCase,
        private getPublicRoomsUseCase: GetPublicRoomsUseCase,
        private updateRoomPermissionsUseCase: UpdateRoomPermissionsUseCase,
        private kickUserUseCase: KickUserUseCase
    ) { }

    async createRoom(req: Request, res: Response): Promise<void> {

        try {


            const createRoomDto: CreateRoomDto = req.body;
            console.log(createRoomDto);

            const userId = req.user?.userId;

            if (!createRoomDto.name || !createRoomDto.description) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Name and description are required'
                });
                return;
            }

            if (createRoomDto.isPrivate && !createRoomDto.password) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Password is required for private rooms'
                });
                return;
            }

            const result = await this.createRoomUseCase.execute(createRoomDto, userId!);

            if (result.success) {
                res.status(HTTP_STATUS.CREATED).json({
                    success: true,
                    message: "room created succesfully",
                    result
                });
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: "Failed to create room",
                    result
                });
            }

        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to create room'
            });
        }
    }



    async joinRoom(req: Request, res: Response): Promise<void> {

        try {
            const { roomId } = req.params;
            const joinRoomDto: JoinRoomDto = { roomId, password: req.body?.password };
            const userId = req.user?.userId;

            if (!roomId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: 'Room ID is required'
                });
                return;
            }
            

            const result = await this.joinRoomUseCase.execute(joinRoomDto, userId!);

            if (result.success) {

                res.status(HTTP_STATUS.OK).json({
                    success: true,
                    message: "succesfully fetched join details",
                    room:result.room
                });

            } else {

                const statusCode = result.error === 'Room not found' ? HTTP_STATUS.NOT_FOUND :
                    result.error === 'Invalid password' ? HTTP_STATUS.UNAUTHORIZED :
                        result.error === 'Room creator will begin shortly' ? HTTP_STATUS.FORBIDDEN :
                            HTTP_STATUS.BAD_REQUEST;

                res.status(statusCode).json({
                    success: false,
                    message: "failed to fetch details",
                    result
                });
            }
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: 'Failed to join room'
            });
        }
    }

    async getPublicRooms(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const result = await this.getPublicRoomsUseCase.execute(limit);

            res.status(HTTP_STATUS.OK).json(result);
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: 'Failed to fetch public rooms',
                rooms: [],
                total: 0
            });
        }
    }

    async updatePermissions(req: Request, res: Response): Promise<void> {
        try {
            const { roomId } = req.params;
            const updateDto: UpdateRoomPermissionsDto = req.body;
            const requesterId = req.user!.id;

            if (!updateDto.userId || !updateDto.permissions) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: 'User ID and permissions are required'
                });
                return;
            }

            const result = await this.updateRoomPermissionsUseCase.execute(roomId, requesterId, updateDto);

            if (result.success) {
                res.status(HTTP_STATUS.OK).json(result);
            } else {
                const statusCode = result.error === 'Room not found' ? HTTP_STATUS.NOT_FOUND :
                    result.error === 'Only room creator can update permissions' ? HTTP_STATUS.FORBIDDEN :
                        HTTP_STATUS.BAD_REQUEST;

                res.status(statusCode).json(result);
            }
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: 'Failed to update permissions'
            });
        }
    }

    async kickUser(req: Request, res: Response): Promise<void> {
        try {
            const { roomId, userId } = req.params;
            const kickDto: KickUserDto = { userId, reason: req.body.reason };
            const requesterId = req.user!.id;

            if (!userId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: 'User ID is required'
                });
                return;
            }

            const result = await this.kickUserUseCase.execute(roomId, requesterId, kickDto);

            if (result.success) {
                res.status(HTTP_STATUS.OK).json(result);
            } else {
                const statusCode = result.error === 'Room not found' ? HTTP_STATUS.NOT_FOUND :
                    result.error?.includes('Only room creator') ? HTTP_STATUS.FORBIDDEN :
                        HTTP_STATUS.BAD_REQUEST;

                res.status(statusCode).json(result);
            }
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: 'Failed to kick user'
            });
        }
    }
}
