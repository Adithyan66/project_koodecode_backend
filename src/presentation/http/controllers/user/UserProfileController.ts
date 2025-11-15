


import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { HttpResponse } from '../../helper/HttpResponse';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError } from '../../../../application/errors/AppErrors';
import { UpdateProfileDto } from '../../../../application/dto/users/UserProfileDto';
import { IUserProfileController } from '../../interfaces/IUserProfileController';
import { IGenerateProfileImageUploadUrlUseCase, IGetUserEditableProfile, IGetUserProfileForUserUseCase, IUpdateProfileImageUseCase, IUpdateUserProfileUseCase } from '../../../../application/interfaces/IProfileUseCase';
import { inject, injectable } from 'tsyringe';




@injectable()
export class UserProfileController implements IUserProfileController {

    constructor(
        @inject('IGetUserProfileForUserUseCase') private getUserProfileUseCase: IGetUserProfileForUserUseCase,
        @inject('IUpdateUserProfileUseCase') private updateUserProfileUseCase: IUpdateUserProfileUseCase,
        @inject('IGetUserEditableProfile') private getUserEditableProfile: IGetUserEditableProfile,
        @inject('IGenerateProfileImageUploadUrlUseCase') private generateUploadUrlUseCase: IGenerateProfileImageUploadUrlUseCase,
        @inject('IUpdateProfileImageUseCase') private updateProfileImageUseCase: IUpdateProfileImageUseCase
    ) { }


    getProfile = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user?.userId;
        const targetUserId = httpRequest.params.userId || userId;
        const year = parseInt(httpRequest.query.year as string) || new Date().getFullYear();

        if (!targetUserId) {
            throw new BadRequestError("User ID is required")
        }

        const profile = await this.getUserProfileUseCase.execute(targetUserId, year);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'profile retrieved successfully', profile),
        });
    }

    updateProfile = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new BadRequestError("User ID is required")
        }

        const updateData: UpdateProfileDto = httpRequest.body;

        const updatedProfile = await this.updateUserProfileUseCase.execute(userId, updateData);
        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Profile updated successfully', updatedProfile),
        });
    }

    getPublicProfile = async (httpRequest: IHttpRequest) => {

        const { username } = httpRequest.params;

        const year = parseInt(httpRequest.query.year as string) || new Date().getFullYear();

        const profile = await this.getUserProfileUseCase.execute(username, year);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Profile fetched successfully', profile),
        });

    }

    getEditProfile = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user?.userId

        if (!userId) {
            throw new BadRequestError("User ID is required")
        }

        const result = await this.getUserEditableProfile.execute(userId)

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Profile fetched successfully', result),
        });
    }

    generateUploadUrl = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user?.userId

        if (!userId) {
            throw new BadRequestError("User ID is required")
        }

        const { fileExtension } = httpRequest.body;

        if (!fileExtension) {
            throw new BadRequestError("File extension is required")
        }

        const result = await this.generateUploadUrlUseCase.execute(userId, { fileExtension });

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'done successfully', result),
        });

    };

    confirmUpload = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new BadRequestError("User ID is required")
        }

        const { imageKey, publicUrl } = httpRequest.body;

        if (!imageKey || !publicUrl) {
            throw new BadRequestError("Image key and public URL are required")
        }

        await this.updateProfileImageUseCase.execute(userId, imageKey, publicUrl);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Profile image updated successfully'),
        });
    };



}
