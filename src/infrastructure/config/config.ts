import dotenv from 'dotenv';
dotenv.config();

export const config = {
    jwtSecret: process.env.JWT_SECRET || " ",
    mongoUri: process.env.MONGO_URI || " ",
    jwtAccessSecret: process.env.JWT_SECRET || " ",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || " ",
    cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE ?? "3600000", 10),
};
