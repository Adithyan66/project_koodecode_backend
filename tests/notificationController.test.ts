import 'reflect-metadata';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NotificationController } from '../src/presentation/http/controllers/notifications/NotificationController';
import { BadRequestError } from '../src/application/errors/AppErrors';
import { HTTP_STATUS } from '../src/shared/constants/httpStatus';
import { IHttpRequest } from '../src/presentation/http/interfaces/IHttpRequest';
import {
  ISubscribeToPushUseCase,
  IUnsubscribeFromPushUseCase,
  ISendAdminNotificationUseCase,
  ISendUserNotificationUseCase,
} from '../src/application/interfaces/INotificationUseCase';
import { SubscribeResponseDto, UnsubscribeResponseDto } from '../src/application/dto/notifications/PushSubscriptionDto';
import { NotificationResponseDto, UserNotificationRequestDto } from '../src/application/dto/notifications/SendNotificationDto';

class NoopSubscribeUseCase implements ISubscribeToPushUseCase {
  async execute(): Promise<SubscribeResponseDto> {
    return { success: true, message: 'ok' };
  }
}

class NoopUnsubscribeUseCase implements IUnsubscribeFromPushUseCase {
  async execute(): Promise<UnsubscribeResponseDto> {
    return { success: true, message: 'ok' };
  }
}

class NoopAdminNotificationUseCase implements ISendAdminNotificationUseCase {
  async execute(): Promise<NotificationResponseDto> {
    return { success: true, message: 'ok', sentCount: 0, failedCount: 0 };
  }
}

class TrackingUserNotificationUseCase implements ISendUserNotificationUseCase {
  public lastCall: { targetUserId: string; data: UserNotificationRequestDto } | null = null;
  constructor(private readonly response: NotificationResponseDto) {}

  async execute(targetUserId: string, data: UserNotificationRequestDto): Promise<NotificationResponseDto> {
    this.lastCall = { targetUserId, data };
    return this.response;
  }
}

const buildController = (userNotificationUseCase: ISendUserNotificationUseCase) =>
  new NotificationController(
    new NoopSubscribeUseCase(),
    new NoopUnsubscribeUseCase(),
    new NoopAdminNotificationUseCase(),
    userNotificationUseCase
  );

describe('NotificationController.sendUserNotification', () => {
  it('sends a notification and returns counts', async () => {
    const useCase = new TrackingUserNotificationUseCase({
      success: true,
      message: 'Notification sent to 2 device(s)',
      sentCount: 2,
      failedCount: 0,
    });
    const controller = buildController(useCase);

    const request: IHttpRequest = {
      user: { userId: 'admin-1' },
      body: {
        targetUserId: 'user-42',
        type: 'ACHIEVEMENT',
        title: 'Badge unlocked!',
        body: 'Congrats!',
        icon: 'https://cdn.example.com/icon.png',
        data: { badgeId: 'streak-7' },
      },
    };

    const response = await controller.sendUserNotification(request);

    assert.equal(response.statusCode, HTTP_STATUS.OK);
    assert.equal(response.body.success, true);
    assert.equal(response.body.message, 'Notification sent to 2 device(s)');
    assert.deepEqual(response.body.data, { sentCount: 2, failedCount: 0 });
    assert.ok(useCase.lastCall);
    assert.equal(useCase.lastCall?.targetUserId, 'user-42');
    assert.equal(useCase.lastCall?.data.title, 'Badge unlocked!');
  });

  it('propagates no-subscription result without errors', async () => {
    const useCase = new TrackingUserNotificationUseCase({
      success: true,
      message: 'User has no active push subscriptions',
      sentCount: 0,
      failedCount: 0,
    });
    const controller = buildController(useCase);

    const request: IHttpRequest = {
      user: { userId: 'admin-1' },
      body: {
        targetUserId: 'user-99',
        type: 'ACHIEVEMENT',
        title: 'Badge unlocked!',
        body: 'Congrats!',
      },
    };

    const response = await controller.sendUserNotification(request);

    assert.equal(response.statusCode, HTTP_STATUS.OK);
    assert.equal(response.body.message, 'User has no active push subscriptions');
    assert.deepEqual(response.body.data, { sentCount: 0, failedCount: 0 });
  });

  it('throws when targetUserId is missing', async () => {
    const controller = buildController(
      new TrackingUserNotificationUseCase({
        success: true,
        message: 'ok',
        sentCount: 1,
        failedCount: 0,
      })
    );

    const request: IHttpRequest = {
      user: { userId: 'admin-1' },
      body: {
        type: 'ACHIEVEMENT',
        title: 'Badge unlocked!',
        body: 'Congrats!',
      },
    };

    await assert.rejects(() => controller.sendUserNotification(request), (error: unknown) => {
      assert.ok(error instanceof BadRequestError);
      assert.equal((error as BadRequestError).message, 'Target user ID is required');
      return true;
    });
  });

  it('throws when type title or body are missing', async () => {
    const controller = buildController(
      new TrackingUserNotificationUseCase({
        success: true,
        message: 'ok',
        sentCount: 1,
        failedCount: 0,
      })
    );

    const request: IHttpRequest = {
      user: { userId: 'admin-1' },
      body: {
        targetUserId: 'user-1',
        title: 'Badge unlocked!',
      },
    };

    await assert.rejects(() => controller.sendUserNotification(request), (error: unknown) => {
      assert.ok(error instanceof BadRequestError);
      assert.equal((error as BadRequestError).message, 'Type, title, and body are required');
      return true;
    });
  });
});


