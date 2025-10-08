

// src/application/usecases/coins/GetCoinStatsUseCase.ts
import { ICoinTransactionRepository, UserCoinStats } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';

export class GetCoinStatsUseCase {
    constructor(private coinTransactionRepository: ICoinTransactionRepository) {}

    async execute(userId: string): Promise<UserCoinStats> {
        return await this.coinTransactionRepository.getUserTransactionStats(userId);
    }
}
