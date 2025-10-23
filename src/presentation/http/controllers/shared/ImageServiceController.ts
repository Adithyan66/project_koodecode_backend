import { inject, injectable } from "tsyringe";
import { IHttpRequest } from "../../interfaces/IHttpRequest";
import { BadRequestError } from "../../../../application/errors/AppErrors";
import { HttpResponse } from "../../helper/HttpResponse";
import { HTTP_STATUS } from "../../../../shared/constants/httpStatus";
import { buildResponse } from "../../../../infrastructure/utils/responseBuilder";
import { IGenerateImageUploadUrlUseCase } from "../../../../application/interfaces/IImageServiceUseCase";
import { IConfirmImageUploadUseCase } from "../../../../application/interfaces/IConfirmImageUploadUseCase";




@injectable()
export class ImageServiceController {

    constructor(
        @inject('IGenerateImageUploadUrlUseCase') private generateUploadUrlUseCase: IGenerateImageUploadUrlUseCase,
        @inject('IConfirmImageUploadUseCase') private confirmImageUploadUseCase: IConfirmImageUploadUseCase
    ) { }


    generateUploadUrl = async (httpRequest: IHttpRequest) => {
        console.log('ImageServiceController.generateUploadUrl called with:', {
            params: httpRequest.params,
            body: httpRequest.body,
            user: httpRequest.user
        });

        const userId = httpRequest.user?.userId

        const { type } = httpRequest.params

         if (!type) {
            throw new BadRequestError("Type is required")
        }

        if (!userId) {
            throw new BadRequestError("User ID is required")
        }

        const { fileExtension } = httpRequest.body;

        if (!fileExtension) {
            throw new BadRequestError("File extension is required")
        }

        console.log('Calling generateUploadUrlUseCase.execute with:', { type, userId, fileExtension });
        const result = await this.generateUploadUrlUseCase.execute(type, userId, { fileExtension });

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Upload URL generated successfully', result),
        });

    };

    confirmUpload = async (httpRequest: IHttpRequest) => {
        console.log('ImageServiceController.confirmUpload called with:', {
            body: httpRequest.body,
            user: httpRequest.user
        });

        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new BadRequestError("User ID is required")
        }

        const { imageKey, publicUrl, imageType } = httpRequest.body;

        if (!imageKey || !publicUrl) {
            throw new BadRequestError("Image key and public URL are required")
        }

        if (!imageType) {
            throw new BadRequestError("Image type is required")
        }

        await this.confirmImageUploadUseCase.execute(userId, imageKey, publicUrl, imageType);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Image upload confirmed successfully'),
        });
    };

}