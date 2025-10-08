

// src/application/usecases/coins/GetCoinBalanceUseCase.ts
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';

export class GetCoinBalanceUseCase {
    constructor(private userProfileRepository: IUserProfileRepository) {}

    async execute(userId: string): Promise<number> {
        const userProfile = await this.userProfileRepository.findByUserId(userId);
        return userProfile?.coinBalance || 0;
    }
}
