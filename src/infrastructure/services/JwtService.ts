import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export class JwtService {

    generateToken(payload: object): string {

        return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
    }

    verifyToken(token: string): object | null {

        try {
            return jwt.verify(token, config.jwtSecret) as object;
        } catch {
            return null;
        }
    }
}
