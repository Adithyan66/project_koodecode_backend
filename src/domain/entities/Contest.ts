

export class Contest {
  public id: string;
  public contestNumber: number;
  public title: string;
  public description: string;
  public createdBy: string;
  public problems: string[];
  public startTime: Date;
  public endTime: Date;
  public thumbnail: string;
  public registrationDeadline: Date;
  public problemTimeLimit: number;
  public maxAttempts: number;
  public wrongSubmissionPenalty: number;
  public coinRewards: ContestReward[];
  public state: ContestState;
  public participants: string[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor({
    id,
    contestNumber,
    title,
    description,
    createdBy,
    problems,
    startTime,
    endTime,
    thumbnail,
    registrationDeadline,
    problemTimeLimit,
    maxAttempts,
    wrongSubmissionPenalty,
    coinRewards,
    state,
    participants = [],
    createdAt = new Date(),
    updatedAt = new Date()
  }: {
    id: string;
    contestNumber: number;
    title: string;
    description: string;
    createdBy: string;
    problems: string[];
    startTime: Date;
    endTime: Date;
    thumbnail: string;
    registrationDeadline: Date;
    problemTimeLimit: number;
    maxAttempts: number;
    wrongSubmissionPenalty: number;
    coinRewards: ContestReward[];
    state: ContestState;
    participants?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id;
    this.contestNumber = contestNumber;
    this.title = title;
    this.description = description;
    this.createdBy = createdBy;
    this.problems = problems;
    this.startTime = startTime;
    this.endTime = endTime;
    this.thumbnail = thumbnail;
    this.registrationDeadline = registrationDeadline;
    this.problemTimeLimit = problemTimeLimit;
    this.maxAttempts = maxAttempts;
    this.wrongSubmissionPenalty = wrongSubmissionPenalty;
    this.coinRewards = coinRewards;
    this.state = state;
    this.participants = participants;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  canRegister(): boolean {
    return this.state === ContestState.UPCOMING || this.state === ContestState.REGISTRATION_OPEN;
  }

  isActive(): boolean {
    return this.state === ContestState.ACTIVE;
  }

  isRegistrationOpen(): boolean {
    return new Date() <= this.registrationDeadline && this.canRegister();
  }

  hasStarted(): boolean {
    return new Date() >= this.startTime;
  }

  hasEnded(): boolean {
    return new Date() >= this.endTime;
  }

  addParticipant(userId: string): void {
    if (!this.participants.includes(userId)) {
      this.participants.push(userId);
      this.updatedAt = new Date();
    }
  }

  removeParticipant(userId: string): void {
    const index = this.participants.indexOf(userId);
    if (index > -1) {
      this.participants.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  updateState(newState: ContestState): void {
    this.state = newState;
    this.updatedAt = new Date();
  }
}

export class ContestReward {
  public rank: number;
  public coins: number;

  constructor({
    rank,
    coins
  }: {
    rank: number;
    coins: number;
  }) {
    this.rank = rank;
    this.coins = coins;
  }
}

export enum ContestState {
  UPCOMING = 'upcoming',
  REGISTRATION_OPEN = 'registration_open',
  ACTIVE = 'active',
  ENDED = 'ended',
  RESULTS_PUBLISHED = 'results_published'
}
