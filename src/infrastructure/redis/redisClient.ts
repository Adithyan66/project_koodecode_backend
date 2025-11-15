import Redis from 'ioredis';
import { config } from '../config/config';

const redis = new Redis({
    host: config.redis.redisHost ,
    port: config.redis.redisPort ,
    password: config.redis.redisPassword ,
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});
redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default redis;
