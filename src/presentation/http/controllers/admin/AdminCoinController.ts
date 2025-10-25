import { CoinTransactionSource } from "../../../../domain/entities/CoinTransaction";
import { buildResponse } from "../../../../infrastructure/utils/responseBuilder";
import { HTTP_STATUS } from "../../../../shared/constants/httpStatus";
import { HttpResponse } from "../../helper/HttpResponse";
import { IHttpRequest } from "../../interfaces/IHttpRequest";




export class AdminCoinController {

    constructor(
        private _awardCoinsUseCase: any
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
            ...buildResponse(true, 'order Created succesfully', transactionData),
        });

    }
}