import { Otp } from '../../domain/entities/Otp';
import { IOtpRepository } from '../../domain/interfaces/repositories/IOtpRepository';
import redis from '../redis/redisClient';

export class RedisOtpRepository implements IOtpRepository {

    async saveOtp(email: string, data: object, ttlSeconds: number): Promise<void> {

        const expiresAt = new Date(Date.now() + ttlSeconds*1000)

        const payload = {
            ...data,
            email,
            expiresAt: expiresAt.toString(),
        }

        console.log("payload at reddis",payload);
        
        await redis.hset(email, payload);

        await redis.expire(email, ttlSeconds);

    }

    async getOtp(email: string): Promise<Otp | null> {

        const data = await redis.hgetall(email);

        console.log("data from reddis ", data);
        

        if (!data || Object.keys(data).length === 0) {
            
            return null;
        }
        
        console.log("othanuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
        return new Otp({
            code: parseInt(data.otp, 10),
            email: data.email,
            expiresAt: new Date(data.expiresAt),
            meta: {
                username: data.userName,
                fullname: data.fullName
            }
        });
    }

    async deleteOtp(email: string): Promise<void> {

        await redis.del(email);
    }
}
