import { IOtpRepository } from '../../application/interfaces/IOtpRepository';
import redis from '../redis/redisClient';

export class RedisOtpRepository implements IOtpRepository {

    async saveOtp(email: string, data: object, ttlSeconds: number): Promise<void> {

        await redis.hset(email, data);

        await redis.expire(email, ttlSeconds);

    }

    async getOtp(email: string): Promise<{ username: string; fullname: string; otp: number } | null> {

        const data = await redis.hgetall(email);

        if (!data || Object.keys(data).length === 0) {
            return null;
        }

        return {
            username: data.userName,
            fullname: data.fullName,
            otp: parseInt(data.otp, 10),
        };
    }

    async deleteOtp(email: string): Promise<void> {

        await redis.del(email);
    }
}
