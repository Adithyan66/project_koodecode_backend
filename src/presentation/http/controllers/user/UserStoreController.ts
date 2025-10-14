






import { inject, injectable } from "tsyringe";
import { PurchaseItemDto } from "../../../../application/dto/store/PurchaseItemDto";
import { BadRequestError } from "../../../../application/errors/AppErrors";
import { buildResponse } from "../../../../infrastructure/utils/responseBuilder";
import { HTTP_STATUS } from "../../../../shared/constants/httpStatus";
import { HttpResponse } from "../../helper/HttpResponse";
import { IHttpRequest } from "../../interfaces/IHttpRequest";
import { IUserStoreController } from "../../interfaces/IUserStoreController";
import { ICheckItemOwnershipUseCase, IGetStoreItemsUseCase, IGetUserInventoryUseCase, IPurchaseStoreItemUseCase } from "../../../../application/interfaces/IStoreUseCase";





@injectable()
export class UserStoreController implements IUserStoreController {

    constructor(
        @inject('IGetStoreItemsUseCase') private getStoreItemsUseCase: IGetStoreItemsUseCase,
        @inject('IPurchaseStoreItemUseCase') private purchaseStoreItemUseCase: IPurchaseStoreItemUseCase,
        @inject('IGetUserInventoryUseCase') private getUserInventoryUseCase: IGetUserInventoryUseCase,
        @inject('ICheckItemOwnershipUseCase') private checkItemOwnershipUseCase: ICheckItemOwnershipUseCase
    ) { }

    getStoreItems = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user?.userId;
        const storeItems = await this.getStoreItemsUseCase.execute(userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'items fetched succesdully', storeItems),
        });

    };

    purchaseItem = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user!.userId;
        const { itemId, quantity = 1 } = httpRequest.body;

        if (!itemId) {
            throw new BadRequestError('Item ID is required');
        }

        const purchaseDto = new PurchaseItemDto(itemId, quantity);
        const result = await this.purchaseStoreItemUseCase.execute(userId, purchaseDto);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, result.message),
        });
    };

    getUserInventory = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user!.userId;
        const inventory = await this.getUserInventoryUseCase.execute(userId);


        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, "inventory fetched", inventory),
        });

    };

    checkItemOwnership = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user!.userId;
        const { itemId } = httpRequest.params;
        const { quantity = 1 } = httpRequest.query;

        const hasOwnership = await this.checkItemOwnershipUseCase.execute(
            userId,
            itemId,
            Number(quantity)
        );

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, " ", hasOwnership),
        });

    };
}
