import { ParticipantStatus } from "./ContestParticipant";



export class ContestLeaderboard {
  public contestId: string;
  public rankings: LeaderboardEntry[];
  public lastUpdated: Date;

  constructor({
    contestId,
    rankings,
    lastUpdated = new Date()
  }: {
    contestId: string;
    rankings: LeaderboardEntry[];
    lastUpdated?: Date;
  }) {
    this.contestId = contestId;
    this.rankings = rankings;
    this.lastUpdated = lastUpdated;
  }

  updateRankings(newRankings: LeaderboardEntry[]): void {
    this.rankings = newRankings;
    this.lastUpdated = new Date();
  }

  getTotalParticipants(): number {
    return this.rankings.length;
  }

  getTopN(n: number): LeaderboardEntry[] {
    return this.rankings.slice(0, n);
  }
}

export class LeaderboardEntry {
  public rank: number;
  public userId: string;
  public username: string;
  public profileImage?: string;
  public totalScore: number;
  public timeTaken: number;
  public attempts: number;
  public status: ParticipantStatus;
  public coinsEarned?: number;

  constructor({
    rank,
    userId,
    username,
    profileImage,
    totalScore,
    timeTaken,
    attempts,
    status,
    coinsEarned
  }: {
    rank: number;
    userId: string;
    username: string;
    profileImage?: string;
    totalScore: number;
    timeTaken: number;
    attempts: number;
    status: ParticipantStatus;
    coinsEarned?: number;
  }) {
    this.rank = rank;
    this.userId = userId;
    this.username = username;
    this.profileImage = profileImage;
    this.totalScore = totalScore;
    this.timeTaken = timeTaken;
    this.attempts = attempts;
    this.status = status;
    this.coinsEarned = coinsEarned;
  }
}
