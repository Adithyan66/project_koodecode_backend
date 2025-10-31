import { injectable } from 'tsyringe';
import webpush from 'web-push';
import { IWebPushService, NotificationPayload } from '../../domain/interfaces/services/IWebPushService';
import { PushSubscription } from '../../domain/entities/PushSubscription';
import { config } from '../config/config';

@injectable()
export class WebPushService implements IWebPushService {
  constructor() {
    webpush.setVapidDetails(
      config.webPush.subject,
      config.webPush.publicKey,
      config.webPush.privateKey
    );
  }

  async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );

      return true;
    } catch (error: any) {
      console.error('Failed to send push notification:', error);

      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log('Subscription expired or invalid:', subscription.endpoint);
      }

      return false;
    }
  }

  async sendBulkNotifications(
    subscriptions: PushSubscription[],
    payload: NotificationPayload
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = subscriptions.map(async (subscription) => {
      const result = await this.sendNotification(subscription, payload);
      if (result) {
        success++;
      } else {
        failed++;
      }
    });

    await Promise.all(promises);

    return { success, failed };
  }
}

