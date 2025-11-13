import { PushSubscription } from '../../entities/PushSubscription';

export interface IPushSubscriptionRepository {
  save(subscription: PushSubscription): Promise<PushSubscription>;
  findByUserId(userId: string): Promise<PushSubscription[]>;
  findByEndpoint(endpoint: string): Promise<PushSubscription | null>;
  delete(id: string): Promise<boolean>;
  deleteByUserId(userId: string): Promise<number>;
  deleteExpired(): Promise<number>;
  findAll(): Promise<PushSubscription[]>;
  findSubscribersWithDetails(params: {
    page: number;
    limit: number;
    search?: string;
    os?: string;
  }): Promise<{
    items: Array<{
      subscriptionId: string;
      userId: string;
      userName: string;
      email: string;
      profilePicUrl?: string;
      keys: {
        p256dh: string;
        auth: string;
      };
      userAgent?: string;
      os: string;
      subscribedAt: Date;
    }>;
    total: number;
  }>;
}

