import express from 'express';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import cookieParser from "cookie-parser";
import cors from "cors"
import "reflect-metadata";


import { cornjob } from './infrastructure/corn/cronJobs';

// import authRoutes from './support/routes/authRoutes';
// import adminProblemRoutes from './presentation/routes/admin/problemRoutes'
// import userProblemRoutes from './presentation/routes/user/problemRoutes';
// import healthRoutes from "./presentation/routes/healthRoutes";
// import profileRoutes from "./support/routes/user/profileRoutes"
// import adminContestRoutes from "./presentation/routes/admin/contestRoutes"
// import userContestRoutes from './presentation/routes/user/contestRoutes';
// import coinPurchaseRoutes from './presentation/routes/user/coinPurchaseRoutes';
// import coinsRoute from './presentation/routes/user/coinRoutes'
// import roomRoutes from './presentation/routes/user/roomRoutes';
// import storeRoutes from "./presentation/routes/user/storeRoutes"
// import { errorMiddleware } from './support/middleware/errorMiddleware';


import authRoutes from './presentation/express/routes/authRoutes'
import userCoinsRoute from './presentation/express/routes/user/userCoinRoute'
import adminCoinsRoute from './presentation/express/routes/admin/adminCoinRoute'
import userContestRoute from './presentation/express/routes/user/userContestRoute'
import userProblemRoute from './presentation/express/routes/user/userProblemRoute'
import adminProblemRoute from './presentation/express/routes/admin/adminProblemRoute'
import userPofileRoutes from './presentation/express/routes/user/userProfileRoute'
import userRoomRoute from './presentation/express/routes/user/userRoomRoute'

import { errorMiddleware } from './presentation/express/middlewares/errorHandler';

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://7eb979cc030d.ngrok-free.app"
  ],
  credentials: true
}))
app.use(json());
app.use(urlencoded({ extended: true }));
cornjob.start()



// app.use('/api/health', healthRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/user', profileRoutes);
// app.use('/api/user/problems', userProblemRoutes);
// app.use('/api/user/contests', userContestRoutes)
// app.use('/api/user/rooms', roomRoutes);
// app.use('/api/user/coins', coinsRoute);
// app.use('/api/user/store', storeRoutes);
// app.use('/api/user/payments', coinPurchaseRoutes);
// app.use('/api/admin/problems', adminProblemRoutes);
// app.use('/api/admin/contests', adminContestRoutes)



app.use("/api/auth", authRoutes);
app.use('/api/user/coins', userCoinsRoute);
app.use('/api/user/contests', userContestRoute)
app.use('/api/user/problems', userProblemRoute)
app.use('/api/admin/problems', adminProblemRoute);
app.use('/api/user', userPofileRoutes);
app.use('/api/user/rooms', userRoomRoute);


// app.use('/api/admin/coins', adminCoinsRoute);



app.use(errorMiddleware);



export { app };


