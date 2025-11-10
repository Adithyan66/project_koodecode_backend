// import { User } from '../../domain/entities/User';

// export interface IUserRepository {
//     findByEmail(email: string): Promise<User | null>;
//     findById(id: string): Promise<User | null>;
//     findByUsername(userName: string): Promise<User | null>;
//     saveUser(user: User): Promise<User>;
//     updateUser(id: string, updates: Partial<User>): Promise<User> | null;
// }

import { User, UserProps } from "../../entities/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByUsername(userName: string): Promise<User | null>;
  saveUser(user: User): Promise<User>;
  updateUser(id: string, updates: Partial<UserProps>): Promise<User | null>;
  changePassword(id: string, hashedPassword: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByGithubId(githubId: string): Promise<User | null>;
  findByEmailAndProvider(email: string, provider: string): Promise<User | null>;
  findAllUsersWithPagination(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    users: User[];
    total: number;
  }>;
  findByIds(ids: string[]): Promise<User[]>;
  findUserWithProfileAndBadges(userId: string): Promise<{
    user: User;
    profile: any;
    badges: any[];
  } | null>;
  blockUser(userId: string, isBlocked: boolean): Promise<User | null>;
}
