


import { inject, injectable } from 'tsyringe';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { IGetCoinBalanceUseCase } from '../../../interfaces/ICoinUseCase';
import { UserProfileNotFoundError } from '../../../../domain/errors/CoinErrors';
import { MissingFieldsError } from '../../../../domain/errors/AuthErrors';

@injectable()
export class GetCoinBalanceUseCase implements IGetCoinBalanceUseCase {

    constructor(
        @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository
    ) { }

    async execute(userId: string): Promise<number> {

        if (!userId) {
            throw new MissingFieldsError(["userId"]);
        }

        const userProfile = await this.userProfileRepository.findByUserId(userId);

        if (!userProfile) {
            throw new UserProfileNotFoundError(userId);
        }

        return userProfile.coinBalance || 0;
    }
}
