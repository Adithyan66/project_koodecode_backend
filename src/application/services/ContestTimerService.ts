

import { Contest, ContestState } from '../../domain/entities/Contest';
import { ContestParticipant, ParticipantStatus } from '../../domain/entities/ContestParticipant';
import { IContestRepository } from '../../domain/interfaces/repositories/IContestRepository';

export class ContestTimerService {

  constructor(
    private contestRepository: IContestRepository
  ) { }


  // checkContestStatus(contest: Contest): ContestState {
  //   const now = new Date();

  //   if (now < contest.registrationDeadline && contest.state === ContestState.UPCOMING) {
  //     return ContestState.REGISTRATION_OPEN;
  //   }

  //   if (now >= contest.startTime && now < contest.endTime && contest.state !== ContestState.ACTIVE) {
  //     return ContestState.ACTIVE;
  //   }

  //   if (now >= contest.endTime && contest.state !== ContestState.ENDED) {
  //     return ContestState.ENDED;
  //   }

  //   return contest.state;
  // }

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
      const newState = this.checkContestStatus(contest);

      if (newState !== contest.state) {
        console.log("varanammmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm", newState);

        contest.state = newState;
        await this.contestRepository.update(contest.id, { state: newState })
        console.log(`[ContestTimerService] Contest ${contest.title} updated to ${newState}`);
      }
    });

    // await Promise.all(updates);
  }
}
