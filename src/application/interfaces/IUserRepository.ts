// import { User } from '../../domain/entities/User';

// export interface IUserRepository {
//     findByEmail(email: string): Promise<User | null>;
//     findById(id: string): Promise<User | null>;
//     findByUsername(userName: string): Promise<User | null>;
//     saveUser(user: User): Promise<User>;
//     updateUser(id: string, updates: Partial<User>): Promise<User> | null;
// }


// application/interfaces/IUserRepository.ts
import { User, UserProps } from "../../domain/entities/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByUsername(userName: string): Promise<User | null>;
  saveUser(user: User): Promise<User>;
  updateUser(id: string, updates: Partial<UserProps>): Promise<User | null>;
}
