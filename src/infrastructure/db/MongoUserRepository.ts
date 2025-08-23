// import { IUserRepository } from '../../domain/repositories/IUserRepository';
// import { User } from '../../domain/entities/User';
// import { UserModel } from './models/UserModel';




// export class MongoUserRepository implements IUserRepository {

//     async findByEmail(email: string): Promise<User | null> {

//         const userDoc = await UserModel.findOne({ email }).exec();

//         if (!userDoc) return null;

//         return new User(userDoc.fullName, userDoc.userName, userDoc.email, userDoc.isAdmin, userDoc.profilePicUrl);
//     }

//     async findByUsername(userName: string): Promise<User | null> {

//         const userDoc = await UserModel.findOne({ userName }).exec();

//         if (!userDoc) return null;

//         return new User(userDoc.fullName, userDoc.userName, userDoc.email, userDoc.isAdmin, userDoc.profilePicUrl);
//     }

//     async saveUser(user: User): Promise<User> {

//         const userDoc = new UserModel({
//             email: user.email,
//             passwordHash: user.passwordHash,
//             fullName: user.fullName,
//             userName: user.userName,
//         });

//         const savedUser = await userDoc.save();

//         return new User(userDoc.fullName, userDoc.userName, userDoc.email, userDoc.isAdmin, userDoc.profilePicUrl);
//     }
// }










import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserModel } from './models/UserModel';

export class MongoUserRepository implements IUserRepository {

  async findByEmail(email: string): Promise<User | null> {

    const userDoc = await UserModel.findOne({ email }).exec();

    if (!userDoc) return null;

    return new User(
      userDoc.fullName,
      userDoc.userName,
      userDoc.email,
      userDoc.passwordHash,
      userDoc.isAdmin,
      userDoc.profilePicUrl,
    );
  }

  async findByUsername(userName: string): Promise<User | null> {

    const userDoc = await UserModel.findOne({ userName }).exec();
    
    if (!userDoc) return null;

    return new User(
      userDoc.fullName,
      userDoc.userName,
      userDoc.email,
      userDoc.passwordHash,
      userDoc.isAdmin,
      userDoc.profilePicUrl,
    );
  }

  async saveUser(user: User): Promise<User> {
    const userDoc = new UserModel({
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      passwordHash: user.passwordHash,
      isAdmin: user.isAdmin,
      profilePicUrl: user.profilePicUrl,
    });

    const savedUser = await userDoc.save();

    return new User(
      savedUser.fullName,
      savedUser.userName,
      savedUser.email,
      savedUser.passwordHash,
      savedUser.isAdmin,
      savedUser.profilePicUrl,
    );
  }
}
