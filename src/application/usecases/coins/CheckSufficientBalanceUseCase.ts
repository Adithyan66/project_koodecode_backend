


import { inject, injectable } from 'tsyringe';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';
import { ICheckSufficientBalanceUseCase } from '../../interfaces/ICoinUseCase';
import { 
    InvalidBalanceAmountError,
    CoinBalanceRetrievalError 
} from '../../../domain/errors/CoinErrors';
import { MissingFieldsError, UserNotFoundError } from '../../../domain/errors/AuthErrors';

@injectable()
export class CheckSufficientBalanceUseCase implements ICheckSufficientBalanceUseCase {

    constructor(
        @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository
    ) { }

    async execute(userId: string, amount: number): Promise<boolean> {

        const missingFields: string[] = [];
        if (!userId) missingFields.push("userId");
        if (amount === undefined || amount === null) missingFields.push("amount");

        if (missingFields.length > 0) {
            throw new MissingFieldsError(missingFields);
        }

        if (amount < 0) {
            throw new InvalidBalanceAmountError(amount);
        }

        try {
            const userProfile = await this.userProfileRepository.findByUserId(userId);
            
            if (!userProfile) {
                throw new UserNotFoundError();
            }

            const balance = userProfile.coinBalance ?? 0;

            if (balance < 0) {
                throw new CoinBalanceRetrievalError(userId);
            }

            return balance >= amount;

        } catch (error) {
            if (error instanceof UserNotFoundError || 
                error instanceof CoinBalanceRetrievalError) {
                throw error;
            }
            throw new CoinBalanceRetrievalError(userId);
        }
    }
}
