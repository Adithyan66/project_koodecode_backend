import { User } from '../entities/User';

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByUsername(userName: string): Promise<User | null>;
    saveUser(user: User): Promise<User>;
}
