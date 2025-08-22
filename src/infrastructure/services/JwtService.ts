// import jwt from 'jsonwebtoken';
// import { config } from '../config/config';

// export class JwtService {

//     generateToken(payload: object): string {

//         return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
//     }

//     verifyToken(token: string): object | null {

//         try {
//             return jwt.verify(token, config.jwtSecret) as object;
//         } catch {
//             return null;
//         }
//     }
// }




import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import Redis from 'ioredis';

const redis = new Redis();

export class JwtService {

    generateAccessToken(payload: object): string {

        return jwt.sign(payload, config.jwtAccessSecret, { expiresIn: '15m' });
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

    verifyRefreshToken(token: string): object | null {

        try {

            return jwt.verify(token, config.jwtRefreshSecret) as object;

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
