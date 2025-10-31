import { inject, injectable } from 'tsyringe';
import { ISubscribeToPushUseCase } from '../../interfaces/INotificationUseCase';
import { IPushSubscriptionRepository } from '../../../domain/interfaces/repositories/IPushSubscriptionRepository';
import { PushSubscription } from '../../../domain/entities/PushSubscription';
import { SubscribeRequestDto, SubscribeResponseDto } from '../../dto/notifications/PushSubscriptionDto';
import { BadRequestError } from '../../errors/AppErrors';

@injectable()
export class SubscribeToPushUseCase implements ISubscribeToPushUseCase {
  constructor(
    @inject('IPushSubscriptionRepository')
    private pushSubscriptionRepository: IPushSubscriptionRepository
  ) {}

  async execute(
    userId: string,
    data: SubscribeRequestDto
  ): Promise<SubscribeResponseDto> {
    if (!data.endpoint || !data.keys?.p256dh || !data.keys?.auth) {
      throw new BadRequestError('Invalid subscription data');
    }

    const subscription = new PushSubscription({
      userId,
      endpoint: data.endpoint,
      keys: {
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      },
      userAgent: data.userAgent,
    });

    await this.pushSubscriptionRepository.save(subscription);

    return {
      success: true,
      message: 'Successfully subscribed to push notifications',
    };
  }
}

