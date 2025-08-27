



import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import Redis from 'ioredis';
import { ITokenService } from '../../application/interfaces/ITokenService';
import { TokenPayload } from '../../shared/types/TokenPayload';

const redis = new Redis();

export class JwtService implements ITokenService {

    generateAccessToken(payload: object): string {

        return jwt.sign(payload, config.jwtAccessSecret, { expiresIn: '10s' });
    }

    generateRefreshToken(payload: object): string {

        return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });
    }

    verifyAccessToken(token: string): object | null {

        try {

            return jwt.verify(token, config.jwtAccessSecret) as object;

        } catch {
            return null;
        }
    }

    verifyRefreshToken(token: string): TokenPayload | null {

        try {

            return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;

        } catch {
            return null;
        }
    }

    async blacklistToken(token: string, exp: number) {
        // store in Redis until it naturally expires
        await redis.setex(`bl_${token}`, exp, 'blacklisted');
    }

    async isBlacklisted(token: string): Promise<boolean> {
        return (await redis.get(`bl_${token}`)) !== null;
    }
}
