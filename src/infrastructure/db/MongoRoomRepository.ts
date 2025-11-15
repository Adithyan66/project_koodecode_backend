import { IRoomRepository } from '../../domain/interfaces/repositories/IRoomRepository';
import { Room, RoomCode, Participant, SubmissionDetail } from '../../domain/entities/Room';
import { RoomModel, RoomDocument } from './models/RoomModel';
import { RoomCodeModel } from './models/RoomCodeModel';

export class MongoRoomRepository implements IRoomRepository {

  async create(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    const roomDoc = new RoomModel(room);
    const savedRoom = await roomDoc.save();
    return this.mapToRoom(savedRoom);
  }

  async findById(id: string): Promise<Room | null> {
    const room = await RoomModel.findById(id).populate('participants.userId', 'username');
    return room ? this.mapToRoom(room) : null;
  }

  async findByRoomId(roomId: string): Promise<Room | null> {

    const room = await RoomModel.findOne({ roomId }).populate('participants.userId', 'username');

    const res = room ? this.mapToRoom(room) : null;
    return res
  }

  async findByRoomNumber(roomNumber: number): Promise<Room | null> {
    const room = await RoomModel.findOne({ roomNumber }).populate('participants.userId', 'username');
    return room ? this.mapToRoom(room) : null;
  }
  async findByName(name: string): Promise<Room | null> {
    const room = await RoomModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive search
    }).lean();
    return room as Room | null;
  }

  
  async findPublicRooms(params: {
    status?: 'active' | 'waiting';
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    rooms: Room[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { status, page, limit, search } = params;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { isPrivate: false };

    if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Execute query with aggregation for participant count
    const [rooms, total] = await Promise.all([
      RoomModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  userName: 1,
                  fullName: 1,
                  profilePicUrl: 1,
                  email: 1
                }
              }
            ]
          }
        },
        { $unwind: '$createdBy' },
        {
          $addFields: {
            id: '$_id',
            participantCount: { $size: '$participants' }
          }
        },
        {
          $project: {
            _id: 0,
            __v: 0,
            password: 0,
            participants: 0,
            permissions: 0
          }
        },
        {
          $sort: {
            status: -1, // active first
            scheduledTime: 1, // earliest scheduled first
            createdAt: -1 // newest first
          }
        },
        { $skip: skip },
        { $limit: limit }
      ]),
      RoomModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      rooms: rooms as Room[],
      total,
      page,
      totalPages
    };
  }


  async findByCreator(userId: string): Promise<Room[]> {
    const rooms = await RoomModel.find({ createdBy: userId })
      .populate('participants.userId', 'username')
      .sort({ createdAt: -1 });

    return rooms.map(room => this.mapToRoom(room));
  }

  async findActiveRooms(): Promise<Room[]> {
    const rooms = await RoomModel.find({
      status: 'active',
      lastActivity: { $gte: new Date(Date.now() - 20 * 60 * 1000) } // Last 20 minutes
    }).populate('participants.userId', 'username');

    return rooms.map(room => this.mapToRoom(room));
  }

  async update(id: string, updates: Partial<Room>): Promise<Room | null> {
    const room = await RoomModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).populate('participants.userId', 'username');

    return room ? this.mapToRoom(room) : null;
  }

  async delete(id: string): Promise<void> {
    await RoomModel.findByIdAndDelete(id);
  }

  async addParticipant(roomId: string, participant: any): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $addToSet: { participants: participant },
        $set: { lastActivity: new Date() }
      }
    );
  }

  async removeParticipant(roomId: string, userId: string): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $pull: { participants: { userId } },
        $set: { lastActivity: new Date() }
      }
    );
  }

  async addKickedUser(roomId: string, userId: string): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $addToSet: { kickedUsers: userId },
        $set: { lastActivity: new Date() }
      }
    );
  }

  async removeKickedUser(roomId: string, userId: string): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $pull: { kickedUsers: userId },
        $set: { lastActivity: new Date() }
      }
    );
  }

  async updateParticipantStatus(roomId: string, userId: string, isOnline: boolean): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId, 'participants.userId': userId },
      {
        $set: {
          'participants.$.isOnline': isOnline,
          lastActivity: new Date()
        }
      }
    );
  }

  async updatePermissions(roomId: string, permissions: any): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $set: {
          permissions,
          lastActivity: new Date()
        }
      }
    );
  }

  async saveRoomCode(roomCode: RoomCode): Promise<void> {
    await RoomCodeModel.findOneAndUpdate(
      { roomId: roomCode.roomId, problemNumber: roomCode.problemNumber },
      roomCode,
      { upsert: true, new: true }
    );
  }

  async getRoomCode(roomId: string): Promise<RoomCode | null> {
    const roomCode = await RoomCodeModel.findOne({ roomId }).sort({ lastModified: -1 });
    return roomCode ? roomCode.toObject() : null;
  }

  async addSubmission(roomId: string, submission: SubmissionDetail): Promise<void> {
    await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $push: { submissions: submission },
        $set: { lastActivity: new Date() }
      }
    );
  }

  async findRoomsByUser(userId: string, page: number, limit: number): Promise<Room[]> {
    const skip = (page - 1) * limit;
    
    const rooms = await RoomModel.find({
      $or: [
        { createdBy: userId },
        { 'participants.userId': userId }
      ]
    })
    .populate('participants.userId', 'username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    return rooms.map(room => this.mapToRoom(room));
  }

  async countRoomsByUser(userId: string): Promise<number> {
    return await RoomModel.countDocuments({
      $or: [
        { createdBy: userId },
        { 'participants.userId': userId }
      ]
    });
  }

  async findAllRoomsForAdmin(params: {
    page: number;
    limit: number;
    search?: string;
    isPrivate?: boolean;
    status?: 'waiting' | 'active' | 'inactive';
    sortBy?: 'createdAt' | 'lastActivity' | 'roomNumber';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    rooms: any[];
    total: number;
  }> {
    const { page, limit, search, isPrivate, status, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const baseQuery: any = {};

    if (isPrivate !== undefined) {
      baseQuery.isPrivate = isPrivate;
    }

    if (status) {
      baseQuery.status = status;
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortField = sortBy === 'roomNumber' ? 'roomNumber' : 
                      sortBy === 'lastActivity' ? 'lastActivity' : 'createdAt';

    const pipeline: any[] = [
      { $match: baseQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
          pipeline: [{
            $project: {
              _id: 1,
              userName: 1
            }
          }]
        }
      },
      { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          participantCount: { $size: '$participants' },
          onlineParticipants: {
            $size: {
              $filter: {
                input: '$participants',
                as: 'participant',
                cond: { $eq: ['$$participant.isOnline', true] }
              }
            }
          },
          createdByStr: { $toString: '$createdBy' },
          createdByUsername: { $ifNull: ['$creator.userName', 'Unknown'] }
        }
      }
    ];

    if (search && search.trim()) {
      const searchValue = search.trim();
      const searchRegex = { $regex: searchValue, $options: 'i' };
      
      pipeline.push({
        $match: {
          $or: [
            { name: searchRegex },
            { roomId: searchRegex },
            { description: searchRegex },
            { createdByUsername: searchRegex }
          ]
        }
      });

      const roomNumber = parseInt(searchValue);
      if (!isNaN(roomNumber)) {
        pipeline[pipeline.length - 1].$match.$or.push({ roomNumber });
      }
    }

    pipeline.push({
      $project: {
        _id: 0,
        id: { $toString: '$_id' },
        roomNumber: 1,
        roomId: 1,
        name: 1,
        thumbnail: 1,
        createdBy: '$createdByStr',
        createdByUsername: 1,
        isPrivate: 1,
        status: 1,
        maxParticipants: 1,
        duration: 1,
        difficulty: 1,
        sessionStartTime: 1,
        sessionEndTime: 1,
        participantCount: 1,
        onlineParticipants: 1,
        lastActivity: 1,
        createdAt: 1
      }
    });

    const sortStage: any = {};
    sortStage[sortField] = sortDirection;

    const facetStage = {
      $facet: {
        data: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [{ $count: 'count' }]
      }
    };

    pipeline.push(facetStage);

    pipeline.push({
      $project: {
        rooms: '$data',
        total: { $arrayElemAt: ['$totalCount.count', 0] }
      }
    });

    const result = await RoomModel.aggregate(pipeline);
    const resultData = result[0] || { rooms: [], total: 0 };

    return {
      rooms: resultData.rooms || [],
      total: resultData.total || 0
    };
  }

  private mapToRoom(roomDoc: RoomDocument): Room {
    return {
      _id: roomDoc._id.toString(),
      id: roomDoc._id.toString(),
      roomNumber: roomDoc.roomNumber,
      roomId: roomDoc.roomId,
      name: roomDoc.name,
      description: roomDoc.description,
      thumbnail: roomDoc.thumbnail,
      createdBy: roomDoc.createdBy.toString(),
      isPrivate: roomDoc.isPrivate,
      password: roomDoc.password,
      scheduledTime: roomDoc.scheduledTime,
      
      maxParticipants: roomDoc.maxParticipants,
      duration: roomDoc.duration,
      difficulty: roomDoc.difficulty,
      config: roomDoc.config,
      sessionStartTime: roomDoc.sessionStartTime,
      sessionEndTime: roomDoc.sessionEndTime,
      
      problemNumber: roomDoc.problemNumber,
      status: roomDoc.status,
      participants: roomDoc.participants.map(p => {
        let userId: string;
        if (p.userId) {
          if (typeof p.userId === 'object' && p.userId._id) {
            userId = p.userId._id.toString();
          } else if (typeof p.userId === 'string') {
            userId = p.userId;
          } else {
            userId = p.userId.toString();
          }
        } else {
          userId = '';
        }
        
        return {
          profilePicUrl: null,
          userId,
          username: p.username || '',
          joinedAt: p.joinedAt,
          isOnline: p.isOnline || false,
          permissions: p.permissions || {}
        };
      }),
      permissions: {
        canEditCode: (roomDoc.permissions?.canEditCode || []).map(id => id.toString()),
        canDrawWhiteboard: (roomDoc.permissions?.canDrawWhiteboard || []).map(id => id.toString()),
        canChangeProblem: (roomDoc.permissions?.canChangeProblem || []).map(id => id.toString())
      },
      kickedUsers: (roomDoc.kickedUsers || []).map(id => id.toString()),
      submissions: roomDoc.submissions?.map(s => ({
        submissionId: s.submissionId.toString(),
        userId: s.userId.toString(),
        submittedAt: s.submittedAt,
        problemId: s.problemId?.toString(),
        score: s.score
      })),
      lastActivity: roomDoc.lastActivity,
      createdAt: roomDoc.createdAt,
      updatedAt: roomDoc.updatedAt
    };
  }
}
