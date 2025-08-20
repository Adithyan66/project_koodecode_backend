import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserModel } from './models/UserModel';




export class MongoUserRepository implements IUserRepository {

    async findByEmail(email: string): Promise<User | null> {

        const userDoc = await UserModel.findOne({ email }).exec();

        if (!userDoc) return null;

        return new User(userDoc.userName, userDoc.fullName, userDoc.email, userDoc.passwordHash);
    }

    async findByUsername(userName: string): Promise<User | null> {

        const userDoc = await UserModel.findOne({ userName }).exec();

        if (!userDoc) return null;

        return new User(userDoc.userName, userDoc.fullName, userDoc.email, userDoc.passwordHash);
    }

    async saveUser(user: User): Promise<User> {

        const userDoc = new UserModel({
            email: user.email,
            passwordHash: user.passwordHash,
            fullName: user.fullName,
            userName: user.userName,
        });

        const savedUser = await userDoc.save();

        return new User(userDoc.userName, userDoc.fullName, userDoc.email, userDoc.passwordHash);
    }
}
