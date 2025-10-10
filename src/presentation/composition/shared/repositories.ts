import { MongoUserRepository } from "../../../infrastructure/db/MongoUserRepository";
import { RedisOtpRepository } from "../../../infrastructure/persistence/RedisOtpRepository";



export const userRepository = new MongoUserRepository();
export const redisOtpService = new RedisOtpRepository()

