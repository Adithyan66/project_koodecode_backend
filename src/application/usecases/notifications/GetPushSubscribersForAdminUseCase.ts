import { inject, injectable } from 'tsyringe';
import { IPushSubscriptionRepository } from '../../../domain/interfaces/repositories/IPushSubscriptionRepository';
import {
  PushSubscriberQueryDto,
  PushSubscriberResponseDto,
} from '../../dto/notifications/AdminPushSubscriberDto';
import { IGetPushSubscribersForAdminUseCase } from '../../interfaces/INotificationUseCase';

@injectable()
export class GetPushSubscribersForAdminUseCase implements IGetPushSubscribersForAdminUseCase {
  constructor(
    @inject('IPushSubscriptionRepository')
    private readonly pushSubscriptionRepository: IPushSubscriptionRepository
  ) {}

  async execute(query: PushSubscriberQueryDto): Promise<PushSubscriberResponseDto> {
    const page = query.page && query.page > 0 ? Math.floor(query.page) : 1;
    const limit = query.limit && query.limit > 0 ? Math.floor(query.limit) : 20;
    const search = query.search?.trim();
    const osFilter = query.os?.trim().toLowerCase();

    const { items, total } = await this.pushSubscriptionRepository.findSubscribersWithDetails({
      page,
      limit,
      search,
      os: osFilter,
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

