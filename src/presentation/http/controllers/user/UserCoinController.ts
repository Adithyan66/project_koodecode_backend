


import { injectable, inject } from "tsyringe";
import { CompletePurchaseDto, CreateCoinPurchaseOrderDto } from "../../../../application/dto/coins/CoinPurchaseDto";
import { ICompleteCoinPurchaseUseCase, ICreateCoinPurchaseOrderUseCase, IGetCoinBalanceUseCase, IGetCoinStatsUseCase, IGetCoinTransactionsUseCase } from "../../../../application/interfaces/ICoinUseCase";
import { buildResponse } from "../../../../infrastructure/utils/responseBuilder";
import { HTTP_STATUS } from "../../../../shared/constants/httpStatus";
import { HttpResponse } from "../../helper/HttpResponse";
import { IHttpRequest } from "../../interfaces/IHttpRequest";
import { IUserCoinController } from "../../interfaces/IUserCoinController";
import { BadRequestError } from "../../../../application/errors/AppErrors";


@injectable()
export class UserCoinController implements IUserCoinController {

    constructor(
        @inject("ICreateCoinPurchaseOrderUseCase") private _createCoinPurchaseOrderUseCase: ICreateCoinPurchaseOrderUseCase,
        @inject("ICompleteCoinPurchaseUseCase") private _completePurchaseUseCase: ICompleteCoinPurchaseUseCase,
        @inject("IGetCoinBalanceUseCase") private _getCoinBalanceUseCase: IGetCoinBalanceUseCase,
        @inject("IGetCoinTransactionsUseCase") private _getCoinTransactionsUseCase: IGetCoinTransactionsUseCase,
        @inject("IGetCoinStatsUseCase") private _getCoinStatsUseCase: IGetCoinStatsUseCase
    ) { }


    createOrder = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user!.userId;
        const { coins } = httpRequest.body;

        if (!coins || typeof coins !== 'number') {
            throw new BadRequestError('Valid coin amount is required and must be positive');
        }

        const dto = new CreateCoinPurchaseOrderDto(coins);
        const order = await this._createCoinPurchaseOrderUseCase.execute(userId, dto);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'order Created succesfully', { order }),
        });
    };


    completePurchase = async (httpRequest: IHttpRequest) => {

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = httpRequest.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            throw new BadRequestError('Payment verification data is required', {
                razorpay_order_id: razorpay_order_id ? 'provided' : 'missing',
                razorpay_payment_id: razorpay_payment_id ? 'provided' : 'missing',
                razorpay_signature: razorpay_signature ? 'provided' : 'missing'
            });
        }

        const dto = new CompletePurchaseDto(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        const result = await this._completePurchaseUseCase.execute(dto);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, result.message, { coins: result.coins }),
        });

    };

    getBalance = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user?.userId;

        if (!userId) {
            throw new BadRequestError('User ID is required');
        }

        const balance = await this._getCoinBalanceUseCase.execute(userId!);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, "balance fetched succesfully", { balance: balance }),
        });
    }

    getTransactions = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user!.userId;
        const limit = parseInt(httpRequest.query.limit as string) || 50;
        const offset = parseInt(httpRequest.query.offset as string) || 0;

        if (limit < 1 || limit > 100) {
            throw new BadRequestError('Limit must be between 1 and 100');
        }

        if (offset < 0) {
            throw new BadRequestError('Offset must be non-negative');
        }

        const transactions = await this._getCoinTransactionsUseCase.execute(userId, limit, offset);

        const transformedData = {
            transactions: transactions.map(t => ({
                id: t.id,
                amount: t.amount,
                type: t.type,
                source: t.source,
                description: t.description,
                metadata: t.metadata,
                createdAt: t.createdAt.toISOString(),
                displayAmount: t.getDisplayAmount()
            })),
            pagination: {
                limit,
                offset,
                hasMore: transactions.length === limit
            }
        };

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, "transactions fetched succesfully", transformedData),
        });
    }

    getStats = async (httpRequest: IHttpRequest) => {

        const userId = httpRequest.user!.userId;
        const stats = await this._getCoinStatsUseCase.execute(userId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, "status fetched succesfully", stats),
        });
    }

}