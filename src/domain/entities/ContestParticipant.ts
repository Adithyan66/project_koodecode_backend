

export class ContestParticipant {

  public id?: string;
  public contestId: string;
  public userId: string;
  public assignedProblemId: string;
  public registrationTime: Date;
  public startTime: Date | null;
  public endTime: Date | null;
  public submissions: ContestSubmission[];
  public totalScore: number;
  public rank: number | null;
  public coinsEarned: number;
  public status: ParticipantStatus;
  public isDeleted: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor({
    id,
    contestId,
    userId,
    assignedProblemId,
    registrationTime,
    startTime = null,
    endTime = null,
    submissions = [],
    totalScore = 0,
    rank = null,
    coinsEarned = 0,
    status = ParticipantStatus.REGISTERED,
    isDeleted = false,
    createdAt = new Date(),
    updatedAt = new Date()
  }: {
    id: string;
    contestId: string;
    userId: string;
    assignedProblemId: string;
    registrationTime: Date;
    startTime?: Date | null;
    endTime?: Date | null;
    submissions?: ContestSubmission[];
    totalScore?: number;
    rank?: number | null;
    coinsEarned?: number;
    status?: ParticipantStatus;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this.contestId = contestId;
    this.userId = userId;
    this.assignedProblemId = assignedProblemId;
    this.registrationTime = registrationTime;
    this.startTime = startTime;
    this.endTime = endTime;
    this.submissions = submissions;
    this.totalScore = totalScore;
    this.rank = rank;
    this.coinsEarned = coinsEarned;
    this.status = status;
    this.isDeleted = isDeleted;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  startContest(): void {
    if (this.status === ParticipantStatus.REGISTERED) {
      this.startTime = new Date();
      this.status = ParticipantStatus.IN_PROGRESS;
      this.updatedAt = new Date();
    }
  }

  addSubmission(submission: ContestSubmission): void {
    this.submissions.push(submission);
    this.updatedAt = new Date();
  }

  completeContest(): void {
    if (this.status === ParticipantStatus.IN_PROGRESS) {
      this.endTime = new Date();
      this.status = ParticipantStatus.COMPLETED;
      this.updatedAt = new Date();
    }
  }

  markTimeUp(): void {
    if (this.status === ParticipantStatus.IN_PROGRESS) {
      this.endTime = new Date();
      this.status = ParticipantStatus.TIME_UP;
      this.updatedAt = new Date();
    }
  }

  updateScore(score: number): void {
    this.totalScore = score;
    this.updatedAt = new Date();
  }

  updateRank(rank: number): void {
    this.rank = rank;
    this.updatedAt = new Date();
  }

  awardCoins(coins: number): void {
    this.coinsEarned = coins;
    this.updatedAt = new Date();
  }

  getTotalAttempts(): number {
    return this.submissions.length;
  }

  getTimeTaken(): number {
    if (this.startTime && this.endTime) {
      return (this.endTime.getTime() - this.startTime.getTime()) / 1000;
    }
    return 0;
  }

  canSubmit(maxAttempts: number): boolean {
    return this.status === ParticipantStatus.IN_PROGRESS && this.submissions.length < maxAttempts;
  }

  softDelete(): void {
    this.isDeleted = true;
    this.updatedAt = new Date();
  }
}





export class ContestSubmission {

    
  public submissionId: string;
  public submittedAt: Date;
  public isCorrect: boolean;
  public timeTaken: number;
  public attemptNumber: number;
  public penaltyApplied: number;

  constructor({
    submissionId,
    submittedAt,
    isCorrect,
    timeTaken,
    attemptNumber,
    penaltyApplied
  }: {
    submissionId: string;
    submittedAt: Date;
    isCorrect: boolean;
    timeTaken: number;
    attemptNumber: number;
    penaltyApplied: number;
  }) {
    this.submissionId = submissionId;
    this.submittedAt = submittedAt;
    this.isCorrect = isCorrect;
    this.timeTaken = timeTaken;
    this.attemptNumber = attemptNumber;
    this.penaltyApplied = penaltyApplied;
  }
}

export enum ParticipantStatus {
  REGISTERED = 'registered',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  TIME_UP = 'time_up',
  DISQUALIFIED = 'disqualified'
}
