import dotenv from 'dotenv';


dotenv.config();

export const config = {

  jwtSecret: process.env.JWT_SECRET || " ",
  mongoUri: process.env.MONGO_URI || " ",
  jwtAccessSecret: process.env.JWT_SECRET || " ",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || " ",
  cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE ?? "3600000", 10),


  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/koodecode'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || ''
  },
  judge0: {
    apiUrl: process.env.JUDGE0_API_URL || 'http://localhost:2358',
    rapidApiHost: process.env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com',
    rapidApiKey: process.env.JUDGE0_RAPIDAPI_KEY || '',
    authToken: process.env.JUDGE0_AUTH_TOKEN || undefined,
    useSelfHosted: process.env.USE_SELF_HOSTED_JUDGE0 === 'true',
    defaultTimeLimit: parseInt(process.env.JUDGE0_DEFAULT_TIME_LIMIT || '5'),
    defaultMemoryLimit: parseInt(process.env.JUDGE0_DEFAULT_MEMORY_LIMIT || '128000'),
    maxPollAttempts: parseInt(process.env.JUDGE0_MAX_POLL_ATTEMPTS || '10'),
    pollInterval: parseInt(process.env.JUDGE0_POLL_INTERVAL || '1000')
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_REGION || "",
    s3BucketName: process.env.S3_BUCKET_NAME || ""
  },

  jitsi: {
    domain: process.env.JITSI_DOMAIN ,
    apiSecret: process.env.JITSI_API_SECRET || 'your-secret'
  },

  socket: {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  }
};

