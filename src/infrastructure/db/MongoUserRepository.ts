// // import { IUserRepository } from '../../domain/repositories/IUserRepository';
// // import { User } from '../../domain/entities/User';
// // import { UserModel } from './models/UserModel';




// // export class MongoUserRepository implements IUserRepository {

// //     async findByEmail(email: string): Promise<User | null> {

// //         const userDoc = await UserModel.findOne({ email }).exec();

// //         if (!userDoc) return null;

// //         return new User(userDoc.fullName, userDoc.userName, userDoc.email, userDoc.isAdmin, userDoc.profilePicUrl);
// //     }

// //     async findByUsername(userName: string): Promise<User | null> {

// //         const userDoc = await UserModel.findOne({ userName }).exec();

// //         if (!userDoc) return null;

// //         return new User(userDoc.fullName, userDoc.userName, userDoc.email, userDoc.isAdmin, userDoc.profilePicUrl);
// //     }

// //     async saveUser(user: User): Promise<User> {

// //         const userDoc = new UserModel({
// //             email: user.email,
// //             passwordHash: user.passwordHash,
// //             fullName: user.fullName,
// //             userName: user.userName,
// //         });

// //         const savedUser = await userDoc.save();

// //         return new User(userDoc.fullName, userDoc.userName, userDoc.email, userDoc.isAdmin, userDoc.profilePicUrl);
// //     }
// // }










// import { IUserRepository } from '../../domain/repositories/IUserRepository';
// import { User } from '../../domain/entities/User';
// import { UserModel } from './models/UserModel';

// export class MongoUserRepository implements IUserRepository {

//   async findByEmail(email: string): Promise<User | null> {

//     const userDoc = await UserModel.findOne({ email }).exec();

//     if (!userDoc) return null;

//     return new User(
//       userDoc._id.toString(),
//       userDoc.fullName,
//       userDoc.userName,
//       userDoc.email,
//       userDoc.passwordHash,
//       userDoc.isAdmin,
//       userDoc.profilePicUrl,
//     );
//   }

//   async findByUsername(userName: string): Promise<User | null> {

//     const userDoc = await UserModel.findOne({ userName }).exec();

//     if (!userDoc) return null;

//     return new User(
//       userDoc.fullName,
//       userDoc.userName,
//       userDoc.email,
//       userDoc.passwordHash,
//       userDoc.isAdmin,
//       userDoc.profilePicUrl,
//     );
//   }

//   async saveUser(user: User): Promise<User> {
//     const userDoc = new UserModel({
//       fullName: user.fullName,
//       userName: user.userName,
//       email: user.email,
//       passwordHash: user.passwordHash,
//       isAdmin: user.isAdmin,
//       profilePicUrl: user.profilePicUrl,
//     });

//     const savedUser = await userDoc.save();

//     return new User(
//       savedUser.fullName,
//       savedUser.userName,
//       savedUser.email,
//       savedUser.passwordHash,
//       savedUser.isAdmin,
//       savedUser.profilePicUrl,
//     );
//   }
// }








import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserModel } from './models/UserModel';

export class MongoUserRepository implements IUserRepository {

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email }).exec();
    console.log("in find db", userDoc);

    if (!userDoc) return null;

    return new User(
      userDoc.fullName,
      userDoc.userName,
      userDoc.email,
      userDoc.role as "user" | "admin",
      userDoc.profilePicUrl,
      userDoc._id.toString(),
      userDoc.passwordHash
    );
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id).exec();
    console.log("in find db", userDoc);

    if (!userDoc) return null;

    return new User(
      userDoc.fullName,
      userDoc.userName,
      userDoc.email,
      userDoc.role as "user" | "admin",
      userDoc.profilePicUrl,
      userDoc._id.toString(),
      userDoc.passwordHash
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
    );
  }

  async saveUser(user: User): Promise<User> {
    const userDoc = new UserModel({
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      passwordHash: user.passwordHash,
      isAdmin: user.role == "admin",
      profilePicUrl: user.profilePicUrl,
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
    );
  }
}
