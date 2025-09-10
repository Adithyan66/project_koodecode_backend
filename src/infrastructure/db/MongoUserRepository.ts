



// import { IUserRepository } from '../../application/interfaces/IUserRepository';
// import { User } from '../../domain/entities/User';
// import { UserModel } from './models/UserModel';

// export class MongoUserRepository implements IUserRepository {

//   async findByEmail(email: string): Promise<User | null> {

//     const userDoc = await UserModel.findOne({ email }).exec();

//     if (!userDoc) return null;

//     return new User(
//       userDoc.fullName,
//       userDoc.userName,
//       userDoc.email,
//       userDoc.role as "user" | "admin",
//       userDoc.profilePicUrl,
//       userDoc._id.toString(),
//       userDoc.passwordHash
//     );
//   }

//   async findById(id: string): Promise<User | null> {
//     const userDoc = await UserModel.findById(id).exec();

//     if (!userDoc) return null;

//     return new User(
//       userDoc.fullName,
//       userDoc.userName,
//       userDoc.email,
//       userDoc.role as "user" | "admin",
//       userDoc.profilePicUrl,
//       userDoc._id.toString(),
//       userDoc.passwordHash
//     );
//   }


//   async findByUsername(userName: string): Promise<User | null> {
//     const userDoc = await UserModel.findOne({ userName }).exec();
//     if (!userDoc) return null;

//     return new User(
//       userDoc.fullName,
//       userDoc.userName,
//       userDoc.email,
//       userDoc.role as "user" | "admin",
//       userDoc.profilePicUrl,
//       userDoc._id.toString(),
//       userDoc.passwordHash,
//     );
//   }

//   async saveUser(user: User): Promise<User> {
//     const userDoc = new UserModel({
//       fullName: user.fullName,
//       userName: user.userName,
//       email: user.email,
//       passwordHash: user.passwordHash,
//       isAdmin: user.role == "admin",
//       profilePicUrl: user.profilePicUrl,
//     });

//     const savedUser = await userDoc.save();

//     return new User(
//       savedUser.fullName,
//       savedUser.userName,
//       savedUser.email,
//       savedUser.role as "user" | "admin",
//       savedUser.profilePicUrl,
//       savedUser._id.toString(),
//       savedUser.passwordHash,
//     );
//   }
// }











import { IUserRepository } from '../../application/interfaces/IUserRepository';
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
      userDoc.role as "user" | "admin",
      userDoc.profilePicUrl,
      userDoc._id.toString(),
      userDoc.passwordHash,
      userDoc.profilePicKey,
      userDoc.createdAt,
      userDoc.updatedAt
    );
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id).exec();
    if (!userDoc) return null;

    return new User(
      userDoc.fullName,
      userDoc.userName,
      userDoc.email,
      userDoc.role as "user" | "admin",
      userDoc.profilePicUrl,
      userDoc._id.toString(),
      userDoc.passwordHash,
      userDoc.profilePicKey,
      userDoc.createdAt,
      userDoc.updatedAt
    );
  }

  async findByUsername(userName: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ userName }).exec();
    if (!userDoc) return null;

    return new User(
      userDoc.fullName,
      userDoc.userName,
      userDoc.email,
      userDoc.role as "user" | "admin",
      userDoc.profilePicUrl,
      userDoc._id.toString(),
      userDoc.passwordHash,
      userDoc.profilePicKey,
      userDoc.createdAt,
      userDoc.updatedAt
    );
  }

  async saveUser(user: User): Promise<User> {
    const userDoc = new UserModel({
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role, // ✅ use "role" instead of "isAdmin"
      profilePicUrl: user.profilePicUrl,
      profilePicKey: user.profilePicKey,
    });

    const savedUser = await userDoc.save();

    return new User(
      savedUser.fullName,
      savedUser.userName,
      savedUser.email,
      savedUser.role as "user" | "admin",
      savedUser.profilePicUrl,
      savedUser._id.toString(),
      savedUser.passwordHash,
      savedUser.profilePicKey,
      savedUser.createdAt,
      savedUser.updatedAt
    );
  }


  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userDoc = await UserModel.findByIdAndUpdate(
      id,
      {
        ...updates,
        updatedAt: new Date(),
      },
      { new: true } 
    ).exec();

    if (!userDoc) return null;

    return new User(
      userDoc.fullName,
      userDoc.userName,
      userDoc.email,
      userDoc.role as "user" | "admin",
      userDoc.profilePicUrl,
      userDoc._id.toString(),
      userDoc.passwordHash,
      userDoc.profilePicKey,
      userDoc.createdAt,
      userDoc.updatedAt
    );
  }
}
