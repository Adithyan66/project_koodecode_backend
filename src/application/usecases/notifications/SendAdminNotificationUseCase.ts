import { inject, injectable } from 'tsyringe';
import { ISendAdminNotificationUseCase } from '../../interfaces/INotificationUseCase';
import { IPushSubscriptionRepository } from '../../../domain/interfaces/repositories/IPushSubscriptionRepository';
import { IWebPushService } from '../../../domain/interfaces/services/IWebPushService';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IContestParticipantRepository } from '../../../domain/interfaces/repositories/IContestParticipantRepository';
import { AdminNotificationRequestDto, NotificationResponseDto } from '../../dto/notifications/SendNotificationDto';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../errors/AppErrors';

@injectable()
export class SendAdminNotificationUseCase implements ISendAdminNotificationUseCase {
  constructor(
    @inject('IPushSubscriptionRepository')
    private pushSubscriptionRepository: IPushSubscriptionRepository,
    @inject('IWebPushService')
    private webPushService: IWebPushService,
    @inject('IUserRepository')
    private userRepository: IUserRepository,
    @inject('IContestParticipantRepository')
    private contestParticipantRepository: IContestParticipantRepository
  ) {}

  async execute(
    adminId: string,
    data: AdminNotificationRequestDto
  ): Promise<NotificationResponseDto> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    if (admin.role !== 'admin') {
      throw new UnauthorizedError('Only admins can send notifications');
    }

    if (!data.title || !data.body) {
      throw new BadRequestError('Title and body are required');
    }

    let targetSubscriptions;

    switch (data.targetType) {
      case 'all':
        targetSubscriptions = await this.pushSubscriptionRepository.findAll();
        break;

      case 'specific':
        if (!data.targetUserIds || data.targetUserIds.length === 0) {
          throw new BadRequestError('Target user IDs are required for specific targeting');
        }
        targetSubscriptions = await this.getSubscriptionsByUserIds(data.targetUserIds);
        break;

      case 'contest':
        if (!data.contestId) {
          throw new BadRequestError('Contest ID is required for contest targeting');
        }
        const participants = await this.contestParticipantRepository.findByContestId(data.contestId);
        const userIds = participants.map(p => p.userId.toString());
        targetSubscriptions = await this.getSubscriptionsByUserIds(userIds);
        break;

      default:
        throw new BadRequestError('Invalid target type');
    }

    if (targetSubscriptions.length === 0) {
      return {
        success: true,
        message: 'No subscribers found for the target',
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
      targetSubscriptions,
      payload
    );

    return {
      success: true,
      message: `Notification sent to ${result.success} subscriber(s)`,
      sentCount: result.success,
      failedCount: result.failed,
    };
  }

  private async getSubscriptionsByUserIds(userIds: string[]) {
    const subscriptions = await Promise.all(
      userIds.map(userId => this.pushSubscriptionRepository.findByUserId(userId))
    );
    return subscriptions.flat();
  }
}

