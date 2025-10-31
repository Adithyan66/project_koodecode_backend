import { inject, injectable } from "tsyringe";
import { BadRequestError, UnauthorizedError } from "../../../../application/errors/AppErrors";
import { buildResponse } from "../../../../infrastructure/utils/responseBuilder";
import { HTTP_STATUS } from "../../../../shared/constants/httpStatus";
import { HttpResponse } from "../../helper/HttpResponse";
import { IHttpRequest } from "../../interfaces/IHttpRequest";
import { IAdminStoreController } from "../../interfaces/IAdminStoreController";
import { 
    IGetAllStoreItemsForAdminUseCase, 
    IUpdateStoreItemUseCase, 
    IToggleStoreItemActiveUseCase 
} from "../../../../application/interfaces/IStoreUseCase";
import { GetAllStoreItemsRequestDto } from "../../../../application/dto/store/admin/GetAllStoreItemsRequestDto";
import { UpdateStoreItemDto } from "../../../../application/dto/store/admin/UpdateStoreItemDto";

@injectable()
export class AdminStoreController implements IAdminStoreController {
    constructor(
        @inject('IGetAllStoreItemsForAdminUseCase') private getAllStoreItemsForAdminUseCase: IGetAllStoreItemsForAdminUseCase,
        @inject('IUpdateStoreItemUseCase') private updateStoreItemUseCase: IUpdateStoreItemUseCase,
        @inject('IToggleStoreItemActiveUseCase') private toggleStoreItemActiveUseCase: IToggleStoreItemActiveUseCase
    ) {}

    getAllStoreItems = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const page = parseInt(httpRequest.query?.page as string) || 1;
        const limit = parseInt(httpRequest.query?.limit as string) || 10;

        const request = new GetAllStoreItemsRequestDto({ page, limit });
        const result = await this.getAllStoreItemsForAdminUseCase.execute(request);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Store items fetched successfully', result),
        });
    };

    updateStoreItem = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const { itemId } = httpRequest.params;
        if (!itemId) {
            throw new BadRequestError('Item ID is required');
        }

        const { price, description, imageUrl, isActive, metadata } = httpRequest.body;

        const updateDto = new UpdateStoreItemDto({
            price,
            description,
            imageUrl,
            isActive,
            metadata
        });

        const result = await this.updateStoreItemUseCase.execute(itemId, updateDto);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'Store item updated successfully', result),
        });
    };

    toggleStoreItemActive = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const { itemId } = httpRequest.params;
        if (!itemId) {
            throw new BadRequestError('Item ID is required');
        }

        const result = await this.toggleStoreItemActiveUseCase.execute(itemId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, `Store item ${result.isActive ? 'activated' : 'deactivated'} successfully`, result),
        });
    };
}

