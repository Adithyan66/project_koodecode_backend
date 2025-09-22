

import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { User, UserProps } from '../../domain/entities/User';
import { UserModel } from './models/UserModel';

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

}
