
import { ContestParticipant, ContestSubmission } from '../../domain/entities/ContestParticipant';
import { IContestParticipantRepository } from '../../domain/interfaces/repositories/IContestParticipantRepository';
import { ContestParticipantModel } from './models/ContestParticipantModel';

export class MongoContestParticipantRepository implements IContestParticipantRepository {
  async create(participant: ContestParticipant): Promise<ContestParticipant> {
    const participantDoc = new ContestParticipantModel({
      contestId: participant.contestId,
      userId: participant.userId,
      assignedProblemId: participant.assignedProblemId,
      registrationTime: participant.registrationTime,
      startTime: participant.startTime,
      endTime: participant.endTime,
      submissions: participant.submissions,
      totalScore: participant.totalScore,
      rank: participant.rank,
      coinsEarned: participant.coinsEarned,
      status: participant.status,
      canContinue: participant.canContinue,
      isDeleted: participant.isDeleted,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt
    });

    const savedParticipant = await participantDoc.save();
    return this.mapToEntity(savedParticipant);
  }

  async findByContestAndUser(contestId: string, userId: string): Promise<ContestParticipant | null> {
    const participant = await ContestParticipantModel.findOne({
      contestId,
      userId,
      isDeleted: { $ne: true }
    }).populate('assignedProblemId', 'title difficulty');

    return participant ? this.mapToEntity(participant) : null;
  }

  async findByContest(contestId: string): Promise<ContestParticipant[]> {
    const participants = await ContestParticipantModel.find({ 
      contestId, 
      isDeleted: { $ne: true } 
    })
      .populate('userId', 'username profileImage')
      .populate('assignedProblemId', 'title difficulty')
      .sort({ totalScore: -1, updatedAt: 1 });

    return participants.map(participant => this.mapToEntity(participant));
  }

  async findByUser(userId: string, page: number = 1, limit: number = 10): Promise<ContestParticipant[]> {
    const skip = (page - 1) * limit;

    const participants = await ContestParticipantModel.find({ 
      userId, 
      isDeleted: { $ne: true } 
    })
      .populate('contestId', 'title contestNumber startTime endTime state')
      .populate('assignedProblemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return participants.map(participant => this.mapToEntity(participant));
  }

  async update(id: string, updates: Partial<ContestParticipant>): Promise<ContestParticipant | null> {
    const participant = await ContestParticipantModel.findByIdAndUpdate(
      id,
      {
        ...updates,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'username profileImage')
      .populate('assignedProblemId', 'title difficulty');

    return participant ? this.mapToEntity(participant) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ContestParticipantModel.findByIdAndDelete(id);
    return !!result;
  }

  async addSubmission(participantId: string, submission: ContestSubmission): Promise<boolean> {
    const result = await ContestParticipantModel.findByIdAndUpdate(
      participantId,
      {
        $push: { submissions: submission },
        updatedAt: new Date()
      }
    );
    return !!result;
  }

  async updateScore(participantId: string, score: number): Promise<boolean> {
    const result = await ContestParticipantModel.findByIdAndUpdate(
      participantId,
      {
        totalScore: score,
        updatedAt: new Date()
      }
    );
    return !!result;
  }

  async updateRank(participantId: string, rank: number): Promise<boolean> {
    const result = await ContestParticipantModel.findByIdAndUpdate(
      participantId,
      {
        rank,
        updatedAt: new Date()
      }
    );
    return !!result;
  }

  async getLeaderboard(contestId: string): Promise<ContestParticipant[]> {
    const participants = await ContestParticipantModel.find({
      contestId,
      $or: [
        { status: 'completed' },
        { status: 'time_up' },
        { status: 'in_progress' }
      ]
    })
      .populate('userId', 'username profileImage')
      .populate('assignedProblemId', 'title difficulty')
      .sort({
        totalScore: -1, 
        updatedAt: 1   
      });

    return participants.map(participant => this.mapToEntity(participant));
  }

  async updateRankings(contestId: string): Promise<void> {
    // Get all participants sorted by score and completion time
    const participants = await ContestParticipantModel.find({
      contestId,
      $or: [
        { status: 'completed' },
        { status: 'time_up' },
        { status: 'in_progress' }
      ]
    }).sort({
      totalScore: -1,
      updatedAt: 1
    });

    // Update ranks in batch
    const bulkOps = participants.map((participant, index) => ({
      updateOne: {
        filter: { _id: participant._id },
        update: {
          rank: index + 1,
          updatedAt: new Date()
        }
      }
    }));

    if (bulkOps.length > 0) {
      await ContestParticipantModel.bulkWrite(bulkOps);
    }
  }

  async getParticipantRank(participantId: string): Promise<number | null> {
    const participant = await ContestParticipantModel.findById(participantId);
    if (!participant) {
      return null;
    }

    // Count participants with higher scores or same score but better time
    const betterParticipants = await ContestParticipantModel.countDocuments({
      contestId: participant.contestId,
      $or: [
        { totalScore: { $gt: participant.totalScore } },
        {
          totalScore: participant.totalScore,
          updatedAt: { $lt: participant.updatedAt }
        }
      ],
      status: { $in: ['completed', 'time_up', 'in_progress'] }
    });

    return betterParticipants + 1;
  }

  async awardCoins(participantId: string, coins: number): Promise<boolean> {
    const result = await ContestParticipantModel.findByIdAndUpdate(
      participantId,
      {
        coinsEarned: coins,
        updatedAt: new Date()
      }
    );
    return !!result;
  }

  // Additional helper methods
  async getContestStats(contestId: string): Promise<{
    totalParticipants: number;
    completedParticipants: number;
    inProgressParticipants: number;
    averageScore: number;
  }> {
    const stats = await ContestParticipantModel.aggregate([
      { $match: { contestId: contestId } },
      {
        $group: {
          _id: null,
          totalParticipants: { $sum: 1 },
          completedParticipants: {
            $sum: {
              $cond: [
                { $in: ['$status', ['completed', 'time_up']] },
                1,
                0
              ]
            }
          },
          inProgressParticipants: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'in_progress'] },
                1,
                0
              ]
            }
          },
          averageScore: { $avg: '$totalScore' }
        }
      }
    ]);

    return stats[0] || {
      totalParticipants: 0,
      completedParticipants: 0,
      inProgressParticipants: 0,
      averageScore: 0
    };
  }

  async getTopPerformers(contestId: string, limit: number = 10): Promise<ContestParticipant[]> {
    const participants = await ContestParticipantModel.find({
      contestId,
      status: { $in: ['completed', 'time_up'] }
    })
      .populate('userId', 'username profileImage')
      .populate('assignedProblemId', 'title difficulty')
      .sort({
        totalScore: -1,
        updatedAt: 1
      })
      .limit(limit);

    return participants.map(participant => this.mapToEntity(participant));
  }

  async getUserContestHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    participants: ContestParticipant[];
    totalCount: number;
  }> {
    const skip = (page - 1) * limit;

    const [participants, totalCount] = await Promise.all([
      ContestParticipantModel.find({ userId })
        .populate('contestId', 'title contestNumber startTime endTime state')
        .populate('assignedProblemId', 'title difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ContestParticipantModel.countDocuments({ userId })
    ]);

    return {
      participants: participants.map(participant => this.mapToEntity(participant)),
      totalCount
    };
  }

  async getParticipantsByStatus(contestId: string, status: string): Promise<ContestParticipant[]> {
    const participants = await ContestParticipantModel.find({
      contestId,
      status
    })
      .populate('userId', 'username profileImage')
      .populate('assignedProblemId', 'title difficulty')
      .sort({ updatedAt: -1 });

    return participants.map(participant => this.mapToEntity(participant));
  }

  async findByContestId(contestId: string): Promise<ContestParticipant[]> {
    const docs = await ContestParticipantModel.find({ contestId }).exec();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findById(id: string): Promise<ContestParticipant | null> {
    const doc = await ContestParticipantModel.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }


  private mapToEntity(participantDoc: any): ContestParticipant {
    return new ContestParticipant({
      id: participantDoc._id.toString(),
      contestId: typeof participantDoc.contestId === 'object' && participantDoc.contestId
        ? participantDoc.contestId._id.toString()
        : participantDoc.contestId ? participantDoc.contestId.toString() : 'invalid-contest-id',
      userId: typeof participantDoc.userId === 'object' && participantDoc.userId
        ? participantDoc.userId._id.toString()
        : participantDoc.userId ? participantDoc.userId.toString() : 'invalid-user-id',
      assignedProblemId: typeof participantDoc.assignedProblemId === 'object' && participantDoc.assignedProblemId
        ? participantDoc.assignedProblemId._id.toString()
        : participantDoc.assignedProblemId ? participantDoc.assignedProblemId.toString() : 'invalid-problem-id',
      registrationTime: participantDoc.registrationTime,
      startTime: participantDoc.startTime,
      endTime: participantDoc.endTime,
      submissions: (participantDoc.submissions || []).map((sub: any) => new ContestSubmission({
        submissionId: sub.submissionId ? sub.submissionId.toString() : '',
        submittedAt: sub.submittedAt,
        isCorrect: sub.isCorrect,
        timeTaken: sub.timeTaken,
        attemptNumber: sub.attemptNumber,
        penaltyApplied: sub.penaltyApplied
      })),
      totalScore: participantDoc.totalScore,
      rank: participantDoc.rank,
      coinsEarned: participantDoc.coinsEarned,
      status: participantDoc.status,
      canContinue: participantDoc.canContinue ?? true,
      isDeleted: participantDoc.isDeleted || false,
      createdAt: participantDoc.createdAt,
      updatedAt: participantDoc.updatedAt
    });
  }

  async softDeleteByContest(contestId: string): Promise<boolean> {
    const result = await ContestParticipantModel.updateMany(
      { contestId },
      { 
        isDeleted: true, 
        updatedAt: new Date() 
      }
    );
    return result.modifiedCount > 0;
  }

  async countByUser(userId: string): Promise<number> {
    return await ContestParticipantModel.countDocuments({ 
      userId, 
      isDeleted: { $ne: true } 
    });
  }
}
