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

  async findSubscribersWithDetails(params: {
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
  }> {
    const page = params.page > 0 ? params.page : 1;
    const limit = params.limit > 0 ? params.limit : 20;
    const search = params.search?.trim();
    const os = params.os?.trim().toLowerCase();
    const skip = (page - 1) * limit;

    const pipeline: mongoose.PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $addFields: {
          normalizedAgent: {
            $toLower: {
              $ifNull: ['$userAgent', ''],
            },
          },
        },
      },
      {
        $addFields: {
          os: {
            $switch: {
              branches: [
                {
                  case: {
                    $regexMatch: { input: '$normalizedAgent', regex: 'windows' },
                  },
                  then: 'windows',
                },
                {
                  case: {
                    $regexMatch: { input: '$normalizedAgent', regex: 'mac os|macos|darwin' },
                  },
                  then: 'macos',
                },
                {
                  case: {
                    $regexMatch: { input: '$normalizedAgent', regex: 'iphone|ipad|ios' },
                  },
                  then: 'ios',
                },
                {
                  case: {
                    $regexMatch: { input: '$normalizedAgent', regex: 'android' },
                  },
                  then: 'android',
                },
                {
                  case: {
                    $regexMatch: { input: '$normalizedAgent', regex: 'linux' },
                  },
                  then: 'linux',
                },
                {
                  case: {
                    $regexMatch: { input: '$normalizedAgent', regex: 'cros' },
                  },
                  then: 'chromeos',
                },
              ],
              default: {
                $cond: [
                  { $eq: ['$normalizedAgent', ''] },
                  'unknown',
                  'other',
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          keys: 1,
          userAgent: 1,
          createdAt: 1,
          os: 1,
          user: {
            _id: '$user._id',
            userName: '$user.userName',
            email: '$user.email',
            profilePicUrl: '$user.profilePicUrl',
          },
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              'user.userName': {
                $regex: search,
                $options: 'i',
              },
            },
            {
              'user.email': {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      });
    }

    if (os) {
      pipeline.push({
        $match: {
          os,
        },
      });
    }

    pipeline.push(
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
          ],
          total: [
            { $count: 'count' },
          ],
        },
      },
      {
        $project: {
          data: 1,
          total: {
            $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0],
          },
        },
      }
    );

    const result = await PushSubscriptionModel.aggregate<{
      data: Array<{
        _id: mongoose.Types.ObjectId;
        userId: mongoose.Types.ObjectId;
        keys: {
          p256dh: string;
          auth: string;
        };
        userAgent?: string;
        createdAt: Date;
        os: string;
        user: {
          _id: mongoose.Types.ObjectId;
          userName: string;
          email: string;
          profilePicUrl?: string;
        };
      }>;
      total: number;
    }>(pipeline);

    const record = result[0] ?? { data: [], total: 0 };

    const items = record.data.map((doc) => ({
      subscriptionId: doc._id.toString(),
      userId: doc.user._id.toString(),
      userName: doc.user.userName,
      email: doc.user.email,
      profilePicUrl: doc.user.profilePicUrl,
      keys: doc.keys,
      userAgent: doc.userAgent,
      os: doc.os,
      subscribedAt: doc.createdAt,
    }));

    return {
      items,
      total: record.total ?? 0,
    };
  }
}

