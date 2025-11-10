

import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { User, UserProps } from '../../domain/entities/User';
import { UserModel } from './models/UserModel';
import { UserProfileModel } from './models/UserProfileModel';
import { Types } from 'mongoose';

export class MongoUserRepository implements IUserRepository {

  private mapToEntity(userDoc: any): User {
    
    return new User({
      id: userDoc._id.toString(),
      fullName: userDoc.fullName,
      userName: userDoc.userName,
      email: userDoc.email,
      role: userDoc.role,
      profilePicUrl: userDoc.profilePicUrl,
      profilePicKey: userDoc.profilePicKey,
      passwordHash: userDoc.passwordHash,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      googleId: userDoc.googleId,
      githubId: userDoc.githubId,
      provider: userDoc.provider,
      emailVerified: userDoc.emailVerified,
      isBlocked: userDoc.isBlocked 
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email }).exec();
    return userDoc ? this.mapToEntity(userDoc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id).exec();
    return userDoc ? this.mapToEntity(userDoc) : null;
  }

  async findByUsername(userName: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ userName }).exec();
    return userDoc ? this.mapToEntity(userDoc) : null;
  }

  async saveUser(user: User): Promise<User> {
    const userDoc = new UserModel({
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      profilePicUrl: user.profilePicUrl,
      profilePicKey: user.profilePicKey,
      isBlocked: user.isBlocked || false
    });

    const savedUser = await userDoc.save();
    return this.mapToEntity(savedUser);
  }

  async updateUser(id: string, updates: Partial<UserProps>): Promise<User | null> {

    const userDoc = await UserModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).exec();

    return userDoc ? this.mapToEntity(userDoc) : null;
  }


  async changePassword(id: string, passwordHash: string): Promise<User | null> {

    const userDoc = await UserModel.findByIdAndUpdate(
      id,
      { passwordHash, updatedAt: new Date() },
      { new: true }
    ).exec()

    return userDoc ? this.mapToEntity(userDoc) : null
  }


  async findByGoogleId(googleId: string): Promise<User | null> {
    const userData = await UserModel.findOne({ googleId });
    return userData ? this.mapToEntity(userData) : null;
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    const userData = await UserModel.findOne({ githubId });
    return userData ? this.mapToEntity(userData) : null;
  }

  async findByEmailAndProvider(email: string, provider: string): Promise<User | null> {
    const userData = await UserModel.findOne({ email, provider });
    return userData ? this.mapToEntity(userData) : null;
  }

  async findAllUsersWithPagination(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    users: User[];
    total: number;
  }> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;
    
    let searchQuery: any = { role: 'user' }; 
    
    if (search) {
      searchQuery.$or = [
        { email: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [users, total] = await Promise.all([
      UserModel.find(searchQuery)
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit)
        .exec(),
      UserModel.countDocuments(searchQuery)
    ]);
    
    return {
      users: users.map(user => this.mapToEntity(user)),
      total
    };
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    const users = await UserModel.find({ _id: { $in: objectIds } }).exec();
    return users.map(user => this.mapToEntity(user));
  }

  async findUserWithProfileAndBadges(userId: string): Promise<{
    user: User;
    profile: any;
    badges: any[];
  } | null> {
    try {
      const userDoc = await UserModel.findById(userId).exec();
      if (!userDoc) {
        return null;
      }

      const profileDoc = await UserProfileModel.findOne({ 
        userId: new Types.ObjectId(userId) 
      }).exec();

      if (!profileDoc) {
        return null;
      }

      const user = this.mapToEntity(userDoc);
      
      return {
        user,
        profile: profileDoc,
        badges: profileDoc.badges || []
      };
    } catch (error) {
      console.error('Error fetching user with profile and badges:', error);
      return null;
    }
  }

  async blockUser(userId: string, isBlocked: boolean): Promise<User | null> {
    const userDoc = await UserModel.findByIdAndUpdate(
      userId,
      { isBlocked, updatedAt: new Date() },
      { new: true }
    ).exec();

    return userDoc ? this.mapToEntity(userDoc) : null;
  }

}
