import { 
  SubscribeRequestDto, 
  SubscribeResponseDto, 
  UnsubscribeResponseDto 
} from '../dto/notifications/PushSubscriptionDto';
import {
  AdminNotificationRequestDto,
  UserNotificationRequestDto,
  NotificationResponseDto,
} from '../dto/notifications/SendNotificationDto';
import {
  PushSubscriberQueryDto,
  PushSubscriberResponseDto,
} from '../dto/notifications/AdminPushSubscriberDto';

export interface ISubscribeToPushUseCase {
  execute(userId: string, data: SubscribeRequestDto): Promise<SubscribeResponseDto>;
}

export interface IUnsubscribeFromPushUseCase {
  execute(userId: string): Promise<UnsubscribeResponseDto>;
}

export interface ISendAdminNotificationUseCase {
  execute(adminId: string, data: AdminNotificationRequestDto): Promise<NotificationResponseDto>;
}

export interface ISendUserNotificationUseCase {
  execute(targetUserId: string, data: UserNotificationRequestDto): Promise<NotificationResponseDto>;
}

export interface IGetPushSubscribersForAdminUseCase {
  execute(query: PushSubscriberQueryDto): Promise<PushSubscriberResponseDto>;
}

