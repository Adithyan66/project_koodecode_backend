import { inject, injectable } from 'tsyringe';
import { ISendUserNotificationUseCase } from '../../interfaces/INotificationUseCase';
import { IPushSubscriptionRepository } from '../../../domain/interfaces/repositories/IPushSubscriptionRepository';
import { IWebPushService } from '../../../domain/interfaces/services/IWebPushService';
import { UserNotificationRequestDto, NotificationResponseDto } from '../../dto/notifications/SendNotificationDto';
import { BadRequestError } from '../../errors/AppErrors';

@injectable()
export class SendUserNotificationUseCase implements ISendUserNotificationUseCase {
  constructor(
    @inject('IPushSubscriptionRepository')
    private pushSubscriptionRepository: IPushSubscriptionRepository,
    @inject('IWebPushService')
    private webPushService: IWebPushService
  ) {}

  async execute(
    targetUserId: string,
    data: UserNotificationRequestDto
  ): Promise<NotificationResponseDto> {
    if (!data.title || !data.body) {
      throw new BadRequestError('Title and body are required');
    }

    const subscriptions = await this.pushSubscriptionRepository.findByUserId(targetUserId);

    if (subscriptions.length === 0) {
      return {
        success: true,
        message: 'User has no active push subscriptions',
        sentCount: 0,
        failedCount: 0,
      };
    }

    const payload = {
      title: data.title,
      body: data.body,
      icon: data.icon,
      data: {
        type: data.type,
        ...data.data,
      },
    };

    const result = await this.webPushService.sendBulkNotifications(
      subscriptions,
      payload
    );

    return {
      success: true,
      message: `Notification sent to ${result.success} device(s)`,
      sentCount: result.success,
      failedCount: result.failed,
    };
  }
}

