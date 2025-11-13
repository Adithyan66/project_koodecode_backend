import 'reflect-metadata';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GetPushSubscribersForAdminUseCase } from '../src/application/usecases/notifications/GetPushSubscribersForAdminUseCase';
import { IPushSubscriptionRepository } from '../src/domain/interfaces/repositories/IPushSubscriptionRepository';
import { PushSubscription } from '../src/domain/entities/PushSubscription';

class StubPushSubscriptionRepository implements IPushSubscriptionRepository {
  public lastParams: {
    page: number;
    limit: number;
    search?: string;
    os?: string;
  } | null = null;

  constructor(private readonly result: {
    items: Array<{
      subscriptionId: string;
      userId: string;
      userName: string;
      email: string;
      profilePicUrl?: string;
      keys: { p256dh: string; auth: string };
      userAgent?: string;
      os: string;
      subscribedAt: Date;
    }>;
    total: number;
  }) {}

  async save(): Promise<PushSubscription> {
    throw new Error('Method not implemented.');
  }

  async findByUserId(): Promise<PushSubscription[]> {
    return [];
  }

  async findByEndpoint(): Promise<PushSubscription | null> {
    return null;
  }

  async delete(): Promise<boolean> {
    return false;
  }

  async deleteByUserId(): Promise<number> {
    return 0;
  }

  async deleteExpired(): Promise<number> {
    return 0;
  }

  async findAll(): Promise<PushSubscription[]> {
    return [];
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
      keys: { p256dh: string; auth: string };
      userAgent?: string;
      os: string;
      subscribedAt: Date;
    }>;
    total: number;
  }> {
    this.lastParams = params;
    return this.result;
  }
}

const sampleItems = [
  {
    subscriptionId: 'sub-1',
    userId: 'user-1',
    userName: 'alice',
    email: 'alice@example.com',
    profilePicUrl: 'https://cdn/alice.png',
    keys: { p256dh: 'key', auth: 'auth' },
    userAgent: 'Mozilla/5.0',
    os: 'windows',
    subscribedAt: new Date('2024-05-02T10:00:00Z'),
  },
];

describe('GetPushSubscribersForAdminUseCase', () => {
  it('returns repository data with pagination meta', async () => {
    const repository = new StubPushSubscriptionRepository({ items: sampleItems, total: 30 });
    const useCase = new GetPushSubscribersForAdminUseCase(repository);

    const result = await useCase.execute({ page: 2, limit: 10 });

    assert.equal(result.items.length, 1);
    assert.equal(result.meta.page, 2);
    assert.equal(result.meta.limit, 10);
    assert.equal(result.meta.total, 30);
    assert.equal(result.meta.totalPages, 3);
    assert.deepEqual(result.items[0], sampleItems[0]);
    assert.equal(repository.lastParams?.page, 2);
    assert.equal(repository.lastParams?.limit, 10);
    assert.equal(repository.lastParams?.search, undefined);
    assert.equal(repository.lastParams?.os, undefined);
  });

  it('normalizes query parameters before repository call', async () => {
    const repository = new StubPushSubscriptionRepository({ items: sampleItems, total: 1 });
    const useCase = new GetPushSubscribersForAdminUseCase(repository);

    const result = await useCase.execute({
      page: -1,
      limit: 0,
      search: '  Bob  ',
      os: 'Android',
    });

    assert.equal(result.meta.page, 1);
    assert.equal(result.meta.limit, 20);
    assert.equal(result.meta.totalPages, 1);
    assert.deepEqual(repository.lastParams, {
      page: 1,
      limit: 20,
      search: 'Bob',
      os: 'android',
    });
  });
});

