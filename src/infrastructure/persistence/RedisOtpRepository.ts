import { IOtpRepository } from '../../application/interfaces/IOtpRepository';
import redis from '../redis/redisClient';

export class RedisOtpRepository implements IOtpRepository {
    async saveOtp(email: string, data: object, ttlSeconds: number): Promise<void> {
        // await redis.set(email, data, 'EX', ttlSeconds);
        await redis.hset(email, data);
        await redis.expire(email, ttlSeconds);

    }
    async getOtp(email: string): Promise<string | null> {
        return redis.get(email);
    }
    async deleteOtp(email: string): Promise<void> {
        await redis.del(email);
    }
}
