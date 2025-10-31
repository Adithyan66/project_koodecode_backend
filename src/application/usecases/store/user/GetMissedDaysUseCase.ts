import { inject, injectable } from 'tsyringe';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { MissedDaysResponseDto } from '../../../dto/store/user/MissedDaysResponseDto';
import { AppError } from '../../../errors/AppError';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { IGetMissedDaysUseCase } from '../../../interfaces/IStoreUseCase';

@injectable()
export class GetMissedDaysUseCase implements IGetMissedDaysUseCase {

    constructor(
        @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository
    ) { }

    async execute(userId: string): Promise<MissedDaysResponseDto> {
        const userProfile = await this.userProfileRepository.findByUserId(userId);
        if (!userProfile) {
            throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
        }

        const missedDays = userProfile.getMissedDaysInCurrentMonth();
        
        const now = new Date();
        const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return new MissedDaysResponseDto({
            missedDays,
            currentMonth,
            canUseTicket: missedDays.length > 0
        });
    }
}

