import { injectable, inject } from "tsyringe";
import { CoinTransactionSource } from "../../../../domain/entities/CoinTransaction";
import { buildResponse } from "../../../../infrastructure/utils/responseBuilder";
import { HTTP_STATUS } from "../../../../shared/constants/httpStatus";
import { MESSAGES } from "../../../../shared/constants/messages";
import { HttpResponse } from "../../helper/HttpResponse";
import { IHttpRequest } from "../../interfaces/IHttpRequest";
import { IGetAdminCoinPurchasesUseCase, IGetAdminCoinPurchaseDetailUseCase, IReconcileCoinPurchaseUseCase, IRefundCoinPurchaseUseCase, IAddNoteToPurchaseUseCase } from "../../../../application/interfaces/ICoinUseCase";
import { AdminCoinPurchaseListRequestDto, ReconcilePurchaseRequestDto, RefundPurchaseRequestDto } from "../../../../application/dto/coins/admin/CoinPurchaseDto";
import { UnauthorizedError, BadRequestError } from "../../../../application/errors/AppErrors";
import { AwardCoinsUseCase } from "../../../../application/usecases/coins/AwardCoinsUseCase";




@injectable()
export class AdminCoinController {

    constructor(
        @inject("IAwardCoinsUseCase") private _awardCoinsUseCase: AwardCoinsUseCase,
        @inject("IGetAdminCoinPurchasesUseCase") private _getAdminCoinPurchasesUseCase: IGetAdminCoinPurchasesUseCase,
        @inject("IGetAdminCoinPurchaseDetailUseCase") private _getAdminCoinPurchaseDetailUseCase: IGetAdminCoinPurchaseDetailUseCase,
        @inject("IReconcileCoinPurchaseUseCase") private _reconcileCoinPurchaseUseCase: IReconcileCoinPurchaseUseCase,
        @inject("IRefundCoinPurchaseUseCase") private _refundCoinPurchaseUseCase: IRefundCoinPurchaseUseCase,
        @inject("IAddNoteToPurchaseUseCase") private _addNoteToPurchaseUseCase: IAddNoteToPurchaseUseCase
    ) { }

    awardCoins = async (httpRequest: IHttpRequest) => {

        const { userId, amount, source, description, metadata } = httpRequest.body;

        if (!userId || !amount || !source || !description) {
            throw new Error()
        }

        if (!Object.values(CoinTransactionSource).includes(source)) {
            throw new Error()
        }

        const transaction = await this._awardCoinsUseCase.execute(
            userId,
            amount,
            source as CoinTransactionSource,
            description,
            metadata
        );

        let transactionData = {
            id: transaction.id,
            userId: transaction.userId,
            amount: transaction.amount,
            type: transaction.type,
            source: transaction.source,
            description: transaction.description,
            createdAt: transaction.createdAt.toISOString()
        }

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, MESSAGES.ORDER_CREATED_SUCCESSFULLY, transactionData),
        });

    }

    getCoinPurchases = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError(MESSAGES.ADMIN_ACCESS_REQUIRED);
        }

        // Extract query parameters
        const page = parseInt(httpRequest.query?.page as string) || 1;
        const limit = parseInt(httpRequest.query?.limit as string) || 20;
        const search = httpRequest.query?.search as string;
        const status = httpRequest.query?.status as 'pending' | 'completed' | 'failed' | 'cancelled';
        const paymentMethod = httpRequest.query?.paymentMethod as 'upi' | 'card' | 'net_banking' | 'wallet' | 'emi';
        const dateRange = httpRequest.query?.dateRange as 'this_month' | 'last_month' | 'custom';
        const startDate = httpRequest.query?.startDate as string;
        const endDate = httpRequest.query?.endDate as string;
        const sortBy = httpRequest.query?.sortBy as string;
        const sortOrder = httpRequest.query?.sortOrder as 'asc' | 'desc';

        const request = new AdminCoinPurchaseListRequestDto({
            page,
            limit,
            search,
            status,
            paymentMethod,
            dateRange,
            startDate,
            endDate,
            sortBy,
            sortOrder
        });

        const result = await this._getAdminCoinPurchasesUseCase.execute(request);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, MESSAGES.COIN_PURCHASES_FETCHED, result),
        });
    }

    getCoinPurchaseDetail = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError(MESSAGES.ADMIN_ACCESS_REQUIRED);
        }

        const { purchaseId } = httpRequest.params;

        if (!purchaseId) {
            throw new BadRequestError(MESSAGES.PURCHASE_ID_REQUIRED);
        }

        const result = await this._getAdminCoinPurchaseDetailUseCase.execute(purchaseId);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, MESSAGES.COIN_PURCHASE_DETAILS_RETRIEVED, result),
        });
    }

    reconcilePurchase = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError(MESSAGES.ADMIN_ACCESS_REQUIRED);
        }

        const { purchaseId } = httpRequest.params;
        const { notes } = httpRequest.body || {};

        if (!purchaseId) {
            throw new BadRequestError(MESSAGES.PURCHASE_ID_REQUIRED);
        }

        const result = await this._reconcileCoinPurchaseUseCase.execute(purchaseId, notes);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, result.message, { success: result.success }),
        });
    }

    refundPurchase = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError(MESSAGES.ADMIN_ACCESS_REQUIRED);
        }

        const { purchaseId } = httpRequest.params;
        const { notes } = httpRequest.body || {};

        if (!purchaseId) {
            throw new BadRequestError(MESSAGES.PURCHASE_ID_REQUIRED);
        }

        if (!notes || notes.trim().length === 0) {
            throw new BadRequestError(MESSAGES.REFUND_NOTES_REQUIRED);
        }

        if (!httpRequest.user.userId) {
            throw new UnauthorizedError(MESSAGES.ADMIN_USER_ID_NOT_FOUND);
        }

        const result = await this._refundCoinPurchaseUseCase.execute(purchaseId, httpRequest.user.userId, notes);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, result.message),
        });
    }

    addNoteToPurchase = async (httpRequest: IHttpRequest) => {
        if (!httpRequest.user || httpRequest.user.role !== 'admin') {
            throw new UnauthorizedError(MESSAGES.ADMIN_ACCESS_REQUIRED);
        }

        const { purchaseId } = httpRequest.params;
        const { notes } = httpRequest.body || {};

        if (!purchaseId) {
            throw new BadRequestError(MESSAGES.PURCHASE_ID_REQUIRED);
        }

        if (!notes || notes.trim().length === 0) {
            throw new BadRequestError(MESSAGES.NOTE_TEXT_REQUIRED);
        }

        if (!httpRequest.user.userId) {
            throw new UnauthorizedError(MESSAGES.ADMIN_USER_ID_NOT_FOUND);
        }

        const result = await this._addNoteToPurchaseUseCase.execute(purchaseId, httpRequest.user.userId, notes);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, result.message),
        });
    }
}