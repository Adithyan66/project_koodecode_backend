import { inject, injectable } from 'tsyringe';
import { IUnsubscribeFromPushUseCase } from '../../interfaces/INotificationUseCase';
import { IPushSubscriptionRepository } from '../../../domain/interfaces/repositories/IPushSubscriptionRepository';
import { UnsubscribeResponseDto } from '../../dto/notifications/PushSubscriptionDto';

@injectable()
export class UnsubscribeFromPushUseCase implements IUnsubscribeFromPushUseCase {
  constructor(
    @inject('IPushSubscriptionRepository')
    private pushSubscriptionRepository: IPushSubscriptionRepository
  ) {}

  async execute(userId: string): Promise<UnsubscribeResponseDto> {
    const deletedCount = await this.pushSubscriptionRepository.deleteByUserId(userId);

    return {
      success: true,
      message: `Unsubscribed from push notifications (${deletedCount} subscription(s) removed)`,
    };
  }
}

