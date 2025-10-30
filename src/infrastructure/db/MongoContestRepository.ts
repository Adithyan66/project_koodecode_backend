

import { Contest } from '../../domain/entities/Contest';
import { IContestRepository, ContestFilters } from '../../domain/interfaces/repositories/IContestRepository';
import { ContestModel } from './models/ContestModel';

export class MongoContestRepository implements IContestRepository {



  async create(contest: Contest): Promise<Contest> {

    const contestDoc = new ContestModel({
      contestNumber: contest.contestNumber,
      title: contest.title,
      description: contest.description,
      createdBy: contest.createdBy,
      problems: contest.problems,
      startTime: contest.startTime,
      endTime: contest.endTime,
      thumbnail: contest.thumbnail,
      registrationDeadline: contest.registrationDeadline,
      problemTimeLimit: contest.problemTimeLimit,
      maxAttempts: contest.maxAttempts,
      wrongSubmissionPenalty: contest.wrongSubmissionPenalty,
      coinRewards: contest.coinRewards,
      state: contest.state,
      participants: contest.participants,
      isDeleted: contest.isDeleted,
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt
    });

    const savedContest = await contestDoc.save();

    return this.mapToEntity(savedContest);
  }



  async findById(id: string): Promise<Contest | null> {
    const contest = await ContestModel.findOne({ _id: id, isDeleted: { $ne: true } })
    console.log("contestssssssssssssssssssssssssssssss",contest);
    
    return contest ? this.mapToEntity(contest) : null;
  }


  async findByNumber(contestNumber: number): Promise<Contest | null> {
    const contest = await ContestModel.findOne({ contestNumber, isDeleted: { $ne: true } }).exec();
    return contest ? this.mapToEntity(contest) : null;
  }

  async find(): Promise<Contest[]> {
    const contests = await ContestModel.find({ isDeleted: { $ne: true } })
    return contests.map(contest => this.mapToEntity(contest))
  }


  async findAll(page: number, limit: number, filters?: ContestFilters): Promise<Contest[]> {
    const query: any = { isDeleted: { $ne: true } };

    if (filters) {
      if (filters.state) {
        query.state = filters.state;
      }
      if (filters.startDate) {
        query.startTime = { $gte: filters.startDate };
      }
      if (filters.endDate) {
        query.endTime = { $lte: filters.endDate };
      }
      if (filters.createdBy) {
        query.createdBy = filters.createdBy;
      }
    }

    const contests = await ContestModel.find(query)
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return contests.map(contest => this.mapToEntity(contest));
  }

  async findByState(state: string): Promise<Contest[]> {
    const contests = await ContestModel.find({ state, isDeleted: { $ne: true } })
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'username')
      .sort({ startTime: 1 });
    return contests.map(contest => this.mapToEntity(contest));
  }

  async findByStateWithPagination(
    state: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<{ contests: Contest[], total: number }> {
    const query: any = { state, isDeleted: { $ne: true } };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [contests, total] = await Promise.all([
      ContestModel.find(query)
        .populate('problems', 'title difficulty')
        .populate('createdBy', 'username')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit),
      ContestModel.countDocuments(query)
    ]);

    return {
      contests: contests.map(contest => this.mapToEntity(contest)),
      total
    };
  }

  async findUpcoming(): Promise<Contest[]> {
    const contests = await ContestModel.find({
      state: { $in: ['upcoming', 'registration_open'] },
      startTime: { $gt: new Date() },
      isDeleted: { $ne: true }
    })
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'username')
      .sort({ startTime: 1 });
    return contests.map(contest => this.mapToEntity(contest));
  }

  async findActive(): Promise<Contest[]> {
    const contests = await ContestModel.find({
      state: 'active',
      startTime: { $lte: new Date() },
      endTime: { $gt: new Date() },
      isDeleted: { $ne: true }
    })
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'username')
      .sort({ startTime: 1 });
    return contests.map(contest => this.mapToEntity(contest));
  }

  async findByCreator(creatorId: string): Promise<Contest[]> {
    const contests = await ContestModel.find({ createdBy: creatorId, isDeleted: { $ne: true } })
      .populate('problems', 'title difficulty')
      .sort({ createdAt: -1 });
    return contests.map(contest => this.mapToEntity(contest));
  }

  async update(id: string, updates: Partial<Contest>): Promise<Contest | null> {
    const contest = await ContestModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    )
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'username');
    return contest ? this.mapToEntity(contest) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ContestModel.findByIdAndDelete(id);
    return !!result;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await ContestModel.findByIdAndUpdate(
      id,
      { 
        isDeleted: true, 
        updatedAt: new Date() 
      }
    );
    return !!result;
  }

  async addParticipant(contestId: string, userId: string): Promise<boolean> {
    const result = await ContestModel.findByIdAndUpdate(
      contestId,
      {
        $addToSet: { participants: userId },
        updatedAt: new Date()
      }
    );
    return !!result;
  }

  async removeParticipant(contestId: string, userId: string): Promise<boolean> {
    const result = await ContestModel.findByIdAndUpdate(
      contestId,
      {
        $pull: { participants: userId },
        updatedAt: new Date()
      }
    );
    return !!result;
  }

  async getParticipantCount(contestId: string): Promise<number> {
    const contest = await ContestModel.findById(contestId, 'participants');
    return contest ? contest.participants.length : 0;
  }

  async updateState(contestId: string, state: string): Promise<boolean> {
    const result = await ContestModel.findByIdAndUpdate(
      contestId,
      {
        state,
        updatedAt: new Date()
      }
    );
    return !!result;
  }

  // Additional helper methods for enhanced functionality
  async findContestsInTimeRange(startDate: Date, endDate: Date): Promise<Contest[]> {
    const contests = await ContestModel.find({
      $or: [
        { startTime: { $gte: startDate, $lte: endDate } },
        { endTime: { $gte: startDate, $lte: endDate } },
        {
          startTime: { $lte: startDate },
          endTime: { $gte: endDate }
        }
      ]
    })
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'username')
      .sort({ startTime: 1 });
    return contests.map(contest => this.mapToEntity(contest));
  }

  async getContestStats(contestId: string): Promise<{
    totalParticipants: number;
    totalProblems: number;
    maxPossibleScore: number;
    isActive: boolean;
    timeRemaining?: number;
  } | null> {
    const contest = await ContestModel.findById(contestId);
    if (!contest) return null;

    const now = new Date();
    const isActive = contest.state === 'active' && now >= contest.startTime && now < contest.endTime;
    const timeRemaining = isActive ? Math.max(0, contest.endTime.getTime() - now.getTime()) : undefined;

    return {
      totalParticipants: contest.participants.length,
      totalProblems: contest.problems.length,
      maxPossibleScore: 1000, // Base score for correct solution
      isActive,
      timeRemaining
    };
  }

  async searchContests(searchQuery: string, page: number = 1, limit: number = 10): Promise<Contest[]> {
    const skip = (page - 1) * limit;

    const contests = await ContestModel.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return contests.map(contest => this.mapToEntity(contest));
  }

  async getContestsByDateRange(startDate: Date, endDate: Date, state?: string): Promise<Contest[]> {
    const query: any = {
      startTime: { $gte: startDate },
      endTime: { $lte: endDate }
    };

    if (state) {
      query.state = state;
    }

    const contests = await ContestModel.find(query)
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'username')
      .sort({ startTime: 1 });

    return contests.map(contest => this.mapToEntity(contest));
  }

  async getTotalContestCount(filters?: ContestFilters): Promise<number> {
    const query: any = {};

    if (filters) {
      if (filters.state) {
        query.state = filters.state;
      }
      if (filters.startDate) {
        query.startTime = { $gte: filters.startDate };
      }
      if (filters.endDate) {
        query.endTime = { $lte: filters.endDate };
      }
      if (filters.createdBy) {
        query.createdBy = filters.createdBy;
      }
    }

    return await ContestModel.countDocuments(query);
  }

  async isUserRegistered(contestId: string, userId: string): Promise<boolean> {
    const contest = await ContestModel.findOne({
      _id: contestId,
      participants: userId
    });
    return !!contest;
  }

  async getContestProblems(contestId: string): Promise<string[]> {
    const contest = await ContestModel.findById(contestId, 'problems');
    return contest ? contest.problems.map(p => p.toString()) : [];
  }

  async updateContestState(contestId: string, newState: string): Promise<Contest | null> {
    const contest = await ContestModel.findByIdAndUpdate(
      contestId,
      {
        state: newState,
        updatedAt: new Date()
      },
      { new: true }
    )
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'username');

    return contest ? this.mapToEntity(contest) : null;
  }

  private mapToEntity(contestDoc: any): Contest {
    return new Contest({
      id: contestDoc._id.toString(),
      contestNumber: contestDoc.contestNumber,
      title: contestDoc.title,
      description: contestDoc.description,
      createdBy: typeof contestDoc.createdBy === 'object'
        ? contestDoc.createdBy._id.toString()
        : contestDoc.createdBy.toString(),
      problems: contestDoc.problems.map((p: any) =>
        typeof p === 'object' ? p._id.toString() : p.toString()
      ),
      startTime: contestDoc.startTime,
      endTime: contestDoc.endTime,
      thumbnail: contestDoc.thumbnail,
      registrationDeadline: contestDoc.registrationDeadline,
      problemTimeLimit: contestDoc.problemTimeLimit,
      maxAttempts: contestDoc.maxAttempts,
      wrongSubmissionPenalty: contestDoc.wrongSubmissionPenalty,
      coinRewards: contestDoc.coinRewards.map((reward: any) => ({
        rank: reward.rank,
        coins: reward.coins
      })),
      state: contestDoc.state,
      participants: contestDoc.participants.map((p: any) =>
        typeof p === 'object' ? p._id.toString() : p.toString()
      ),
      isDeleted: contestDoc.isDeleted || false,
      createdAt: contestDoc.createdAt,
      updatedAt: contestDoc.updatedAt
    });
  }
}
