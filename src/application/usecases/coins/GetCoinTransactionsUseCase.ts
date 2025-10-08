

// src/application/usecases/coins/GetCoinTransactionsUseCase.ts
import { CoinTransaction } from '../../../domain/entities/CoinTransaction';
import { ICoinTransactionRepository } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';

export class GetCoinTransactionsUseCase {
    constructor(private coinTransactionRepository: ICoinTransactionRepository) {}

    async execute(userId: string, limit: number = 50, offset: number = 0): Promise<CoinTransaction[]> {
        return await this.coinTransactionRepository.findByUserId(userId, limit, offset);
    }
}
