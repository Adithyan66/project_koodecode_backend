import { Request, Response } from 'express';
import { CreateCoinPurchaseOrderUseCase } from '../../../application/usecases/coins/CreateCoinPurchaseOrderUseCase';
import { CompleteCoinPurchaseUseCase } from '../../../application/usecases/coins/CompleteCoinPurchaseUseCase';
import { CreateCoinPurchaseOrderDto, CompletePurchaseDto } from '../../../application/dto/coins/CoinPurchaseDto';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import { AppError } from '../../../shared/exceptions/AppError';

export class CoinPurchaseController {
    constructor(
        private createOrderUseCase: CreateCoinPurchaseOrderUseCase,
        private completePurchaseUseCase: CompleteCoinPurchaseUseCase
    ) { }

    createOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
            
            const userId = req.user!.userId;
            const { coins } = req.body;

            if (!coins || typeof coins !== 'number') {
                throw new AppError('Coins amount is required', HTTP_STATUS.BAD_REQUEST);
            }

            const dto = new CreateCoinPurchaseOrderDto(coins);
            const order = await this.createOrderUseCase.execute(userId, dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: order
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                throw new AppError('Failed to create purchase order', HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        }
    };

    completePurchase = async (req: Request, res: Response): Promise<void> => {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                throw new AppError('Payment verification data is required', HTTP_STATUS.BAD_REQUEST);
            }

            const dto = new CompletePurchaseDto(razorpay_order_id, razorpay_payment_id, razorpay_signature);
            const result = await this.completePurchaseUseCase.execute(dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message,
                data: {
                    coins: result.coins
                }
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                throw new AppError('Purchase completion failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        }
    };
}
