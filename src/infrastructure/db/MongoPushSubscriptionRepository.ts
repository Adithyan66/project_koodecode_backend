import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { IPushSubscriptionRepository } from '../../domain/interfaces/repositories/IPushSubscriptionRepository';
import { PushSubscription } from '../../domain/entities/PushSubscription';
import { PushSubscriptionModel } from './models/PushSubscriptionModel';

@injectable()
export class MongoPushSubscriptionRepository implements IPushSubscriptionRepository {
  async save(subscription: PushSubscription): Promise<PushSubscription> {
    const existing = await PushSubscriptionModel.findOne({
      endpoint: subscription.endpoint,
    });

    if (existing) {
      existing.userId = subscription.userId as any;
      existing.keys = subscription.keys;
      existing.userAgent = subscription.userAgent;
      existing.expiresAt = subscription.expiresAt;
      await existing.save();

      return new PushSubscription({
        id: existing._id?.toString(),
        userId: existing.userId.toString(),
        endpoint: existing.endpoint,
        keys: existing.keys,
        userAgent: existing.userAgent,
        createdAt: existing.createdAt,
        expiresAt: existing.expiresAt,
      });
    }

    const doc = await PushSubscriptionModel.create({
      userId: new mongoose.Types.ObjectId(subscription.userId),
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: subscription.userAgent,
      expiresAt: subscription.expiresAt,
    });

    return new PushSubscription({
      id: doc._id?.toString(),
      userId: doc.userId.toString(),
      endpoint: doc.endpoint,
      keys: doc.keys,
      userAgent: doc.userAgent,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
    });
  }

  async findByUserId(userId: string): Promise<PushSubscription[]> {
    const docs = await PushSubscriptionModel.find({ userId: new mongoose.Types.ObjectId(userId) });
    return docs.map(
      (doc) =>
        new PushSubscription({
          id: doc._id?.toString(),
          userId: doc.userId.toString(),
          endpoint: doc.endpoint,
          keys: doc.keys,
          userAgent: doc.userAgent,
          createdAt: doc.createdAt,
          expiresAt: doc.expiresAt,
        })
    );
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscription | null> {
    const doc = await PushSubscriptionModel.findOne({ endpoint });
    if (!doc) return null;

    return new PushSubscription({
      id: doc._id?.toString(),
      userId: doc.userId.toString(),
      endpoint: doc.endpoint,
      keys: doc.keys,
      userAgent: doc.userAgent,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await PushSubscriptionModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await PushSubscriptionModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    return result.deletedCount || 0;
  }

  async deleteExpired(): Promise<number> {
    const result = await PushSubscriptionModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount || 0;
  }

  async findAll(): Promise<PushSubscription[]> {
    const docs = await PushSubscriptionModel.find();
    return docs.map(
      (doc) =>
        new PushSubscription({
          id: doc._id?.toString(),
          userId: doc.userId.toString(),
          endpoint: doc.endpoint,
          keys: doc.keys,
          userAgent: doc.userAgent,
          createdAt: doc.createdAt,
          expiresAt: doc.expiresAt,
        })
    );
  }
}

