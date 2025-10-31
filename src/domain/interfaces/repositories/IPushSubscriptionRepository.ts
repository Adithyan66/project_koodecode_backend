import { PushSubscription } from '../../entities/PushSubscription';

export interface IPushSubscriptionRepository {
  save(subscription: PushSubscription): Promise<PushSubscription>;
  findByUserId(userId: string): Promise<PushSubscription[]>;
  findByEndpoint(endpoint: string): Promise<PushSubscription | null>;
  delete(id: string): Promise<boolean>;
  deleteByUserId(userId: string): Promise<number>;
  deleteExpired(): Promise<number>;
  findAll(): Promise<PushSubscription[]>;
}

