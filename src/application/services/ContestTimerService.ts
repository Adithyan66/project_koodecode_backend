


import { inject, injectable } from 'tsyringe';
import { Contest, ContestState } from '../../domain/entities/Contest';
import { ContestParticipant, ParticipantStatus } from '../../domain/entities/ContestParticipant';
import { IContestRepository } from '../../domain/interfaces/repositories/IContestRepository';
import { IDistributeContestRewardsUseCase } from '../interfaces/IContestUseCase';
import { IPushSubscriptionRepository } from '../../domain/interfaces/repositories/IPushSubscriptionRepository';
import { IWebPushService } from '../../domain/interfaces/services/IWebPushService';
import { IContestParticipantRepository } from '../../domain/interfaces/repositories/IContestParticipantRepository';
import { NotificationType } from '../../shared/constants/NotificationTypes';

@injectable()
export class ContestTimerService {
  constructor(
    @inject("IContestRepository") private contestRepository: IContestRepository,
    @inject("IDistributeContestRewardsUseCase") private distributeContestRewardsUseCase: IDistributeContestRewardsUseCase,
    @inject("IPushSubscriptionRepository") private pushSubscriptionRepository: IPushSubscriptionRepository,
    @inject("IWebPushService") private webPushService: IWebPushService,
    @inject("IContestParticipantRepository") private contestParticipantRepository: IContestParticipantRepository
  ) { }

  checkContestStatus(contest: Contest): ContestState {
    const now = new Date();

    if (now < contest.registrationDeadline) {
      return ContestState.REGISTRATION_OPEN;
    }

    if (now >= contest.startTime && now < contest.endTime) {
      return ContestState.ACTIVE;
    }

    if (now >= contest.endTime) {
      return ContestState.ENDED;
    }

    return contest.state;
  }

  checkParticipantTimeLimit(participant: ContestParticipant, contest: Contest): boolean {
    if (!participant.startTime || participant.status !== ParticipantStatus.IN_PROGRESS) {
      return false;
    }

    const now = new Date();
    const timeLimitMs = contest.problemTimeLimit * 60 * 1000;
    const elapsedTime = now.getTime() - participant.startTime.getTime();

    return elapsedTime >= timeLimitMs;
  }

  getRemainingTime(participant: ContestParticipant, contest: Contest): number {
    if (!participant.startTime) {
      return contest.problemTimeLimit * 60;
    }

    const now = new Date();
    const timeLimitMs = contest.problemTimeLimit * 60 * 1000;
    const elapsedTime = now.getTime() - participant.startTime.getTime();
    const remainingMs = timeLimitMs - elapsedTime;

    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  getContestRemainingTime(contest: Contest): number {
    const now = new Date();

    if (contest.state === ContestState.UPCOMING || contest.state === ContestState.REGISTRATION_OPEN) {
      return Math.max(0, Math.floor((contest.startTime.getTime() - now.getTime()) / 1000));
    }

    if (contest.state === ContestState.ACTIVE) {
      return Math.max(0, Math.floor((contest.endTime.getTime() - now.getTime()) / 1000));
    }

    return 0;
  }

  async updateContestStatuses(): Promise<void> {
    const contests = await this.contestRepository.find();

    const updates = contests.map(async (contest) => {
      const currentState = contest.state;
      const newState = this.checkContestStatus(contest);

      if (newState !== currentState) {
        contest.state = newState;
        await this.contestRepository.update(contest.id, { state: newState });

        if (newState === ContestState.REGISTRATION_OPEN && currentState === ContestState.UPCOMING) {
          await this.sendRegistrationOpenNotification(contest);
        }

        if (newState === ContestState.ACTIVE && currentState === ContestState.REGISTRATION_OPEN) {
          await this.sendContestStartNotification(contest);
        }

        if (newState === ContestState.ENDED && currentState === ContestState.ACTIVE) {
          try {
            const result = await this.distributeContestRewardsUseCase.execute(contest.id);

            if (!result.distributed && result.reason) {
            }

            await this.sendContestEndNotification(contest);
          } catch (error) {
            console.error(`[ContestTimerService] Failed to distribute rewards for contest ${contest.title}:`, error);
          }
        }
      }
    });

    await Promise.all(updates);
  }

  private async sendRegistrationOpenNotification(contest: Contest): Promise<void> {
    try {
      const allSubscriptions = await this.pushSubscriptionRepository.findAll();

      if (allSubscriptions.length === 0) return;

      await this.webPushService.sendBulkNotifications(allSubscriptions, {
        title: `New Contest: "${contest.title}"`,
        body: 'Registration is now open! Register now to participate.',
        icon: '📢',
        data: {
          type: NotificationType.ADMIN_ANNOUNCEMENT,
          contestId: contest.id,
        },
      });

      console.log(`[ContestTimerService] Sent registration open notifications for contest ${contest.title} to ${allSubscriptions.length} subscriptions`);
    } catch (error) {
      console.error(`[ContestTimerService] Failed to send registration open notification:`, error);
    }
  }

  private async sendContestStartNotification(contest: Contest): Promise<void> {
    try {
      const participants = await this.contestParticipantRepository.findByContestId(contest.id);
      const userIds = participants.map(p => p.userId.toString());
      
      if (userIds.length === 0) return;

      const subscriptions = await Promise.all(
        userIds.map(userId => this.pushSubscriptionRepository.findByUserId(userId))
      );
      const allSubscriptions = subscriptions.flat();

      if (allSubscriptions.length === 0) return;

      await this.webPushService.sendBulkNotifications(allSubscriptions, {
        title: `Contest "${contest.title}" has started!`,
        body: 'Join now and start solving problems!',
        icon: '🏁',
        data: {
          type: NotificationType.CONTEST_STARTING,
          contestId: contest.id,
        },
      });

      console.log(`[ContestTimerService] Sent start notifications for contest ${contest.title} to ${allSubscriptions.length} subscriptions`);
    } catch (error) {
      console.error(`[ContestTimerService] Failed to send contest start notification:`, error);
    }
  }

  private async sendContestEndNotification(contest: Contest): Promise<void> {
    try {
      const participants = await this.contestParticipantRepository.findByContestId(contest.id);
      const userIds = participants.map(p => p.userId.toString());
      
      if (userIds.length === 0) return;

      const subscriptions = await Promise.all(
        userIds.map(userId => this.pushSubscriptionRepository.findByUserId(userId))
      );
      const allSubscriptions = subscriptions.flat();

      if (allSubscriptions.length === 0) return;

      await this.webPushService.sendBulkNotifications(allSubscriptions, {
        title: `Contest "${contest.title}" - Results Published!`,
        body: 'Check the leaderboard to see your rank and rewards!',
        icon: '🎉',
        data: {
          type: NotificationType.CONTEST_ENDED,
          contestId: contest.id,
        },
      });

      console.log(`[ContestTimerService] Sent results published notifications for contest ${contest.title} to ${allSubscriptions.length} subscriptions`);
    } catch (error) {
      console.error(`[ContestTimerService] Failed to send contest end notification:`, error);
    }
  }

  // Manual method to distribute rewards for a specific contest
  async distributeContestRewards(contestId: string): Promise<void> {
    try {
      const result = await this.distributeContestRewardsUseCase.execute(contestId);
      console.log(`[ContestTimerService] Manual reward distribution: ${result.rewardsGiven} participants received coins`);
    } catch (error) {
      console.error(`[ContestTimerService] Failed to manually distribute rewards:`, error);
      throw error;
    }
  }
}
