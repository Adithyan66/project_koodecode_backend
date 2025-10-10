
import { Request, Response } from 'express';
import { GetStoreItemsUseCase } from '../../../application/usecases/store/GetStoreItemsUseCase';
import { PurchaseStoreItemUseCase } from '../../../application/usecases/store/PurchaseStoreItemUseCase';
import { GetUserInventoryUseCase } from '../../../application/usecases/store/GetUserInventoryUseCase';
import { CheckItemOwnershipUseCase } from '../../../application/usecases/store/CheckItemOwnershipUseCase';
import { PurchaseItemDto } from '../../../application/dto/store/PurchaseItemDto';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import { AppError } from '../../../shared/exceptions/AppError';

export class StoreController {
    constructor(
        private getStoreItemsUseCase: GetStoreItemsUseCase,
        private purchaseStoreItemUseCase: PurchaseStoreItemUseCase,
        private getUserInventoryUseCase: GetUserInventoryUseCase,
        private checkItemOwnershipUseCase: CheckItemOwnershipUseCase
    ) {}

    getStoreItems = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            const storeItems = await this.getStoreItemsUseCase.execute(userId);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: storeItems
            });
        } catch (error) {
            throw new AppError('Failed to fetch store items', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    };

    purchaseItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const { itemId, quantity = 1 } = req.body;

            if (!itemId) {
                throw new AppError('Item ID is required', HTTP_STATUS.BAD_REQUEST);
            }

            const purchaseDto = new PurchaseItemDto(itemId, quantity);
            const result = await this.purchaseStoreItemUseCase.execute(userId, purchaseDto);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                throw new AppError('Purchase failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        }
    };

    getUserInventory = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const inventory = await this.getUserInventoryUseCase.execute(userId);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: inventory
            });
        } catch (error) {
            throw new AppError('Failed to fetch user inventory', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    };

    checkItemOwnership = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const { itemId } = req.params;
            const { quantity = 1 } = req.query;

            const hasOwnership = await this.checkItemOwnershipUseCase.execute(
                userId, 
                itemId, 
                Number(quantity)
            );
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { hasOwnership }
            });
        } catch (error) {
            throw new AppError('Failed to check item ownership', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    };
}
