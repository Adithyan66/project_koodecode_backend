

import { Contest } from '../../entities/Contest';

export interface IContestRepository {
  create(contest: Contest): Promise<Contest>;
  findById(id: string): Promise<Contest | null>;
  findByNumber(contestNumber: number): Promise<Contest | null>;
  findAll(page: number, limit: number, filters?: ContestFilters): Promise<Contest[]>;
  findByState(state: string): Promise<Contest[]>;
  findUpcoming(): Promise<Contest[]>;
  findActive(): Promise<Contest[]>;
  findByCreator(creatorId: string): Promise<Contest[]>;
  update(id: string, updates: Partial<Contest>): Promise<Contest | null>;
  delete(id: string): Promise<boolean>;
  addParticipant(contestId: string, userId: string): Promise<boolean>;
  removeParticipant(contestId: string, userId: string): Promise<boolean>;
  getParticipantCount(contestId: string): Promise<number>;
  updateState(contestId: string, state: string): Promise<boolean>;
}

export interface ContestFilters {
  state?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
}
