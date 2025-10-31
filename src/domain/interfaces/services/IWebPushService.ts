import { PushSubscription } from '../../entities/PushSubscription';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
}

export interface IWebPushService {
  sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean>;
  
  sendBulkNotifications(
    subscriptions: PushSubscription[],
    payload: NotificationPayload
  ): Promise<{ success: number; failed: number }>;
}

