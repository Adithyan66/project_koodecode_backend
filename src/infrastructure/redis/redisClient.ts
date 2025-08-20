import Redis from 'ioredis';
import { config } from '../config/config';

const redis = new Redis({
    host: config.redisHost || '127.0.0.1',
    port: config.redisPort || 6379,
    password: config.redisPassword || undefined,
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});
redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default redis;
