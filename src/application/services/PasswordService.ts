import bcrypt from 'bcrypt';
import { IPasswordService } from '../../domain/interfaces/services/IPasswordService';

export class PasswordService implements IPasswordService {

    async hashPassword(password: string): Promise<string> {

        return bcrypt.hash(password, 10);
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {

        return bcrypt.compare(password, hash);
    }
}
