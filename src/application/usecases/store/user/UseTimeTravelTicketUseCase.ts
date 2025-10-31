import { inject, injectable } from 'tsyringe';
import { IUserInventoryRepository } from '../../../../domain/interfaces/repositories/IUserInventoryRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { IStoreItemRepository } from '../../../../domain/interfaces/repositories/IStoreItemRepository';
import { UseTimeTravelTicketDto } from '../../../dto/store/user/UseTimeTravelTicketDto';
import { AppError } from '../../../errors/AppError';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { StoreItemType } from '../../../../domain/entities/StoreItem';
import { IUseTimeTravelTicketUseCase } from '../../../interfaces/IStoreUseCase';

@injectable()
export class UseTimeTravelTicketUseCase implements IUseTimeTravelTicketUseCase {

    constructor(
        @inject('IUserInventoryRepository') private userInventoryRepository: IUserInventoryRepository,
        @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository,
        @inject('IStoreItemRepository') private storeItemRepository: IStoreItemRepository
    ) { }

    async execute(userId: string, useTicketData: UseTimeTravelTicketDto): Promise<{ success: boolean; message: string }> {
        
        const timeTravelTickets = await this.storeItemRepository.findByType(StoreItemType.TIME_TRAVEL_TICKET);
        if (!timeTravelTickets || timeTravelTickets.length === 0) {
            throw new AppError('Time Travel Ticket not found in store', HTTP_STATUS.NOT_FOUND);
        }

        const timeTravelTicket = timeTravelTickets[0];

        const inventoryItem = await this.userInventoryRepository.findByUserIdAndItemId(userId, timeTravelTicket.id!);
        if (!inventoryItem || inventoryItem.quantity < 1) {
            throw new AppError('You do not have any Time Travel Tickets', HTTP_STATUS.BAD_REQUEST);
        }

        const userProfile = await this.userProfileRepository.findByUserId(userId);
        if (!userProfile) {
            throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
        }

        const validation = userProfile.canFillDate(useTicketData.dateToFill);
        if (!validation.canFill) {
            throw new AppError(validation.reason || 'Cannot fill this date', HTTP_STATUS.BAD_REQUEST);
        }

        userProfile.fillMissedDay(useTicketData.dateToFill);

        await this.userProfileRepository.update(userId, {
            activities: userProfile.activities
        });

        inventoryItem.use(1);
        await this.userInventoryRepository.updateQuantity(userId, timeTravelTicket.id!, inventoryItem.quantity);

        return {
            success: true,
            message: `Successfully used Time Travel Ticket to fill activity for ${useTicketData.dateToFill}`
        };
    }
}

