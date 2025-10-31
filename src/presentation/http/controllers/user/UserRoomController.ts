


import { CreateRoomDto } from '../../../../application/dto/rooms/users/CreateRoomDto';
import { JoinRoomDto } from '../../../../application/dto/rooms/users/JoinRoomDto';
import { UpdateRoomPermissionsDto, KickUserDto } from '../../../../application/dto/rooms/users/UpdateRoomPermissionsDto';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { BadRequestError } from '../../../../application/errors/AppErrors';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { inject, injectable } from 'tsyringe';
import { ICreateRoomUseCase, IGetPublicRoomsUseCase, IJoinRoomUseCase, IKickUserUseCase, IUpdateRoomPermissionsUseCase, IVerifyPrivateRoomUseCase } from '../../../../application/interfaces/IRoomUseCase';



@injectable()
export class UserRoomController {

    constructor(
        @inject('ICreateRoomUseCase') private createRoomUseCase: ICreateRoomUseCase,
        @inject('IJoinRoomUseCase') private joinRoomUseCase: IJoinRoomUseCase,
        @inject('IGetPublicRoomsUseCase') private getPublicRoomsUseCase: IGetPublicRoomsUseCase,
        @inject('IUpdateRoomPermissionsUseCase') private updateRoomPermissionsUseCase: IUpdateRoomPermissionsUseCase,
        @inject('IKickUserUseCase') private kickUserUseCase: IKickUserUseCase,
        @inject('IVerifyPrivateRoomUseCase') private verifyPrivateRoomUseCase: IVerifyPrivateRoomUseCase
    ) { }



    createRoom = async (httpRequest: IHttpRequest) => {

        const createRoomDto: CreateRoomDto = httpRequest.body;

        const userId = httpRequest.user?.userId;

        if (!createRoomDto.name || !createRoomDto.description) {
            throw new BadRequestError('Name and description are required')
        }

        if (createRoomDto.isPrivate && !createRoomDto.password) {
            throw new BadRequestError('Password is required for private rooms')
        }

        const result = await this.createRoomUseCase.execute(createRoomDto, userId!);
        console.log(result);

        if (result.success) {
            return new HttpResponse(HTTP_STATUS.CREATED, {
                ...buildResponse(true, 'room created  successfully', result.room),
            });
        } else {
            
            return new HttpResponse(HTTP_STATUS.BAD_REQUEST, {
                ...buildResponse(false, 'Failed to create room', result.room),
            }); 
        }
    }



    joinRoom = async (httpRequest: IHttpRequest) => {

        const { roomId } = httpRequest.params;
        const joinRoomDto: JoinRoomDto = { roomId, password: httpRequest.body?.password };
        const userId = httpRequest.user?.userId;

        if (!roomId) {
            throw new BadRequestError('Room ID is required')
        }

        const result = await this.joinRoomUseCase.execute(joinRoomDto, userId!);

        if (result.success) {
            return new HttpResponse(HTTP_STATUS.OK, {
                ...buildResponse(true, 'succesfully fetched join details', result.room),
            });

        } else {

            const statusCode = result.error === 'Room not found' ? HTTP_STATUS.NOT_FOUND :
                result.error === 'Invalid password' ? HTTP_STATUS.UNAUTHORIZED :
                    result.error === 'Room creator will begin shortly' ? HTTP_STATUS.FORBIDDEN :
                        HTTP_STATUS.BAD_REQUEST;

            return new HttpResponse(statusCode, {
                ...buildResponse(true, 'failed to fetch details', result),
            });
        }
    }


    getPublicRooms = async (httpRequest: IHttpRequest) => {

        const {
            status,
            page = '1',
            limit = '9',
            search
        } = httpRequest.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        if (isNaN(pageNum) || pageNum < 1) {
            throw new BadRequestError('Invalid page number')
        }

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
            throw new BadRequestError('Limit must be between 1 and 50')
        }

        if (status && !['active', 'waiting'].includes(status as string)) {
            throw new BadRequestError('Invalid status. Must be "active" or "waiting"')
        }

        const result = await this.getPublicRoomsUseCase.execute({
            status: status as 'active' | 'waiting' | undefined,
            page: pageNum,
            limit: limitNum,
            search: search as string
        });

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'public rooms fetches succesfully', result),
        });
    };



    updatePermissions = async (httpRequest: IHttpRequest) => {

        const { roomId } = httpRequest.params;
        const updateDto: UpdateRoomPermissionsDto = httpRequest.body;
        const requesterId = httpRequest.user.userId;

        if (!updateDto.userId || !updateDto.permissions) {
            throw new BadRequestError('User ID and permissions are required')
        }

        const result = await this.updateRoomPermissionsUseCase.execute(roomId, requesterId, updateDto);

        if (result.success) {
            return new HttpResponse(HTTP_STATUS.OK, {
                ...buildResponse(true, 'permissions updates succesfully', result),
            });

        } else {

            const statusCode = result.error === 'Room not found' ? HTTP_STATUS.NOT_FOUND :
                result.error === 'Only room creator can update permissions' ? HTTP_STATUS.FORBIDDEN :
                    HTTP_STATUS.BAD_REQUEST;

            return new HttpResponse(statusCode, {
                ...buildResponse(false, 'failed to update', result),
            });
        }
    }

    kickUser = async (httpRequest: IHttpRequest) => {

        const { roomId, userId } = httpRequest.params;
        const kickDto: KickUserDto = { userId, reason: httpRequest.body.reason };
        const requesterId = httpRequest.user!.id;

        if (!userId) {
            throw new BadRequestError('User ID is required')
        }

        const result = await this.kickUserUseCase.execute(roomId, requesterId, kickDto);

        if (result.success) {
            return new HttpResponse(HTTP_STATUS.OK, {
                ...buildResponse(true, 'succesfully kick user', result),
            });

        } else {

            const statusCode = result.error === 'Room not found' ? HTTP_STATUS.NOT_FOUND :
                result.error?.includes('Only room creator') ? HTTP_STATUS.FORBIDDEN :
                    HTTP_STATUS.BAD_REQUEST;

            return new HttpResponse(statusCode, {
                ...buildResponse(false, '', result),
            });
        }
    }

    validateRoom = async (httpRequest: IHttpRequest) => {

        const { roomName, password } = httpRequest.body;

        if (!roomName || !password) {
            throw new BadRequestError('Room name and password are required')
        }

        const result = await this.verifyPrivateRoomUseCase.execute({
            roomName,
            password
        });

        if (result.success) {

            return new HttpResponse(HTTP_STATUS.OK, {
                ...buildResponse(true, 'room credentials verified', result.roomId),
            });

        } else {

            let statusCode: number = HTTP_STATUS.BAD_REQUEST

            if (result.error?.includes('Room not found')) {
                statusCode = HTTP_STATUS.NOT_FOUND
            } else if (result.error?.includes('Invalid password')) {
                statusCode = HTTP_STATUS.UNAUTHORIZED
            } else if (result.error?.includes('inactive')) {
                statusCode = HTTP_STATUS.FORBIDDEN
            }

            return new HttpResponse(statusCode, {
                ...buildResponse(true, '', result),
            });
        }

    }
}
