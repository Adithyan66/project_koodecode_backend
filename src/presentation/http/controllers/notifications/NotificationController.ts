import { injectable, inject } from 'tsyringe';
import {
  ISubscribeToPushUseCase,
  IUnsubscribeFromPushUseCase,
  ISendAdminNotificationUseCase,
  ISendUserNotificationUseCase,
  IGetPushSubscribersForAdminUseCase,
} from '../../../../application/interfaces/INotificationUseCase';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { HttpResponse } from '../../helper/HttpResponse';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { BadRequestError } from '../../../../application/errors/AppErrors';

@injectable()
export class NotificationController {
  constructor(
    @inject('ISubscribeToPushUseCase') private subscribeToPushUseCase: ISubscribeToPushUseCase,
    @inject('IUnsubscribeFromPushUseCase') private unsubscribeFromPushUseCase: IUnsubscribeFromPushUseCase,
    @inject('ISendAdminNotificationUseCase') private sendAdminNotificationUseCase: ISendAdminNotificationUseCase,
    @inject('ISendUserNotificationUseCase') private sendUserNotificationUseCase: ISendUserNotificationUseCase,
    @inject('IGetPushSubscribersForAdminUseCase') private getPushSubscribersForAdminUseCase: IGetPushSubscribersForAdminUseCase
  ) { }

  subscribeToPush = async (httpRequest: IHttpRequest) => {
    const userId = httpRequest.user!.userId;
    const { endpoint, keys, userAgent } = httpRequest.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new BadRequestError('Invalid subscription data');
    }

    const result = await this.subscribeToPushUseCase.execute(userId, {
      endpoint,
      keys,
      userAgent,
    });

    return new HttpResponse(
      HTTP_STATUS.OK,
      buildResponse(true, result.message, null)
    );
  };

  unsubscribeFromPush = async (httpRequest: IHttpRequest) => {
    const userId = httpRequest.user!.userId;

    const result = await this.unsubscribeFromPushUseCase.execute(userId);

    return new HttpResponse(
      HTTP_STATUS.OK,
      buildResponse(true, result.message, null)
    );
  };

  sendAdminNotification = async (httpRequest: IHttpRequest) => {
    const adminId = httpRequest.user!.userId;
    const { type, title, body, targetType, targetUserIds, contestId, icon, data } = httpRequest.body;

    if (!type || !title || !body || !targetType) {
      throw new BadRequestError('Type, title, body, and targetType are required');
    }

    const result = await this.sendAdminNotificationUseCase.execute(adminId, {
      type,
      title,
      body,
      targetType,
      targetUserIds,
      contestId,
      icon,
      data,
    });

    return new HttpResponse(
      HTTP_STATUS.OK,
      buildResponse(true, result.message, {
        sentCount: result.sentCount,
        failedCount: result.failedCount,
      })
    );
  };

  sendUserNotification = async (httpRequest: IHttpRequest) => {
    const { targetUserId, type, title, body, icon, data } = httpRequest.body ?? {};

    if (!targetUserId) {
      throw new BadRequestError('Target user ID is required');
    }

    if (!type || !title || !body) {
      throw new BadRequestError('Type, title, and body are required');
    }

    const result = await this.sendUserNotificationUseCase.execute(targetUserId, {
      type,
      title,
      body,
      icon,
      data,
    });

    return new HttpResponse(
      HTTP_STATUS.OK,
      buildResponse(true, result.message, {
        sentCount: result.sentCount,
        failedCount: result.failedCount,
      })
    );
  };

  getVapidPublicKey = async (httpRequest: IHttpRequest) => {
    const { config } = await import('../../../../infrastructure/config/config');

    return new HttpResponse(
      HTTP_STATUS.OK,
      buildResponse(true, 'VAPID public key retrieved', {
        publicKey: config.webPush.publicKey,
      })
    );
  };

  getPushSubscribers = async (httpRequest: IHttpRequest) => {
    const page = httpRequest.query?.page ? Number(httpRequest.query.page) : undefined;
    const limit = httpRequest.query?.limit ? Number(httpRequest.query.limit) : undefined;
    const search = httpRequest.query?.search ? String(httpRequest.query.search) : undefined;
    const os = httpRequest.query?.os ? String(httpRequest.query.os) : undefined;

    const result = await this.getPushSubscribersForAdminUseCase.execute({
      page,
      limit,
      search,
      os,
    });

    return new HttpResponse(
      HTTP_STATUS.OK,
      buildResponse(true, 'Push subscribers fetched', result)
    );
  };
}

