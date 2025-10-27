import express from 'express';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import cookieParser from "cookie-parser";
import cors from "cors"
import "reflect-metadata";


import { cornjob } from './infrastructure/corn/cronJobs';


import authRoutes from './presentation/express/routes/shared/authRoutes'
import userCoinsRoute from './presentation/express/routes/user/userCoinRoute'
import adminCoinsRoute from './presentation/express/routes/admin/adminCoinRoute'
import userContestRoute from './presentation/express/routes/user/userContestRoute'
import userProblemRoute from './presentation/express/routes/user/userProblemRoute'
import adminProblemRoute from './presentation/express/routes/admin/adminProblemRoute'
import userPofileRoutes from './presentation/express/routes/user/userProfileRoute'
import userRoomRoute from './presentation/express/routes/user/userRoomRoute'
import userStoreRoute from './presentation/express/routes/user/userStoreRoute'
import adminContestRoute from './presentation/express/routes/admin/adminContestRoute'
import adminUserRoute from './presentation/express/routes/admin/adminUserRoute'

import { errorMiddleware } from './presentation/express/middlewares/errorHandler';
import imageServiceRoute from './presentation/express/routes/shared/imageServiceRoute'
import healthRoute from './presentation/express/routes/shared/healthRoute'
import webhookRoute from './presentation/express/routes/webhooks/razorpayWebhookRoute'
dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://7eb979cc030d.ngrok-free.app",
    "http://localhost:5174"
  ],
  credentials: true
}))
app.use(json());
app.use(urlencoded({ extended: true }));
cornjob.start()




app.use("/api/auth", authRoutes);

// Webhook route - no authentication
app.use('/api/webhooks', webhookRoute);

app.use('/api/user', userPofileRoutes);
app.use('/api/user/coins', userCoinsRoute);
app.use('/api/user/contests', userContestRoute)
app.use('/api/user/problems', userProblemRoute)
app.use('/api/user/rooms', userRoomRoute);
app.use('/api/user/store', userStoreRoute);


app.use('/api/admin/contests', adminContestRoute)
app.use('/api/admin/problems', adminProblemRoute);
app.use('/api/admin/users', adminUserRoute);

app.use('/api/image-service', imageServiceRoute)
app.use('/api/health', healthRoute);

app.use(errorMiddleware);



export { app };


