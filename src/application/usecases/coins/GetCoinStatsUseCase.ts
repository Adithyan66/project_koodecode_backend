

// import { inject, injectable } from 'tsyringe';
// import { ICoinTransactionRepository, UserCoinStats } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
// import { IGetCoinStatsUseCase } from '../../interfaces/ICoinUseCase';


// @injectable()
// export class GetCoinStatsUseCase implements IGetCoinStatsUseCase{

//     constructor(
//         @inject("ICoinTransactionRepository") private coinTransactionRepository: ICoinTransactionRepository
//     ) { }

//     async execute(userId: string): Promise<UserCoinStats> {

//         return await this.coinTransactionRepository.getUserTransactionStats(userId);
//     }
// }



import { inject, injectable } from 'tsyringe';
import { ICoinTransactionRepository, UserCoinStats } from '../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { IGetCoinStatsUseCase } from '../../interfaces/ICoinUseCase';
import { CoinStatsRetrievalError } from '../../../domain/errors/CoinErrors';
import { MissingFieldsError } from '../../../domain/errors/AuthErrors';

@injectable()
export class GetCoinStatsUseCase implements IGetCoinStatsUseCase {

    constructor(
        @inject("ICoinTransactionRepository") private coinTransactionRepository: ICoinTransactionRepository
    ) { }

    async execute(userId: string): Promise<UserCoinStats> {

        if (!userId) {
            throw new MissingFieldsError(["userId"]);
        }

        try {
            return await this.coinTransactionRepository.getUserTransactionStats(userId);
        } catch (error) {
            throw new CoinStatsRetrievalError(userId);
        }
    }
}
