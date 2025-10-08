

// src/application/usecases/coins/CheckSufficientBalanceUseCase.ts
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';

export class CheckSufficientBalanceUseCase {
    constructor(private userProfileRepository: IUserProfileRepository) {}

    async execute(userId: string, amount: number): Promise<boolean> {
        const userProfile = await this.userProfileRepository.findByUserId(userId);
        const balance = userProfile?.coinBalance || 0;
        return balance >= amount;
    }
}
