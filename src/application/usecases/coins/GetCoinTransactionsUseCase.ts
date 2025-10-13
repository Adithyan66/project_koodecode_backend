



import { inject, injectable } from 'tsyringe';
import { CoinTransaction } from '../../../domain/entities/CoinTransaction';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IGetCoinTransactionsUseCase } from '../../interfaces/ICoinUseCase';
import { CoinTransactionsRetrievalError, InvalidPaginationParametersError } from '../../../domain/errors/CoinErrors';
import { MissingFieldsError } from '../../../domain/errors/AuthErrors';

@injectable()
export class GetCoinTransactionsUseCase implements IGetCoinTransactionsUseCase {

    constructor(
        @inject("ICoinTransactionRepository") private coinTransactionRepository: ICoinTransactionRepository
    ) { }

    async execute(userId: string, limit: number = 50, offset: number = 0): Promise<CoinTransaction[]> {

        if (!userId) {
            throw new MissingFieldsError(["userId"]);
        }

        if (limit < 1 || limit > 100) {
            throw new InvalidPaginationParametersError("Limit must be between 1 and 100");
        }

        if (offset < 0) {
            throw new InvalidPaginationParametersError("Offset must be non-negative");
        }

        try {
            return await this.coinTransactionRepository.findByUserId(userId, limit, offset);
        } catch (error) {
            throw new CoinTransactionsRetrievalError(userId);
        }
    }
}
