import express from 'express';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import cookieParser from "cookie-parser";
import cors from "cors"

import { cornjob } from './infrastructure/corn/cronJobs';

import authRoutes from './presentation/routes/authRoutes';
import adminProblemRoutes from './presentation/routes/admin/problemRoutes'
import userProblemRoutes from './presentation/routes/user/problemRoutes';
import healthRoutes from "./presentation/routes/healthRoutes";
import profileRoutes from "./presentation/routes/user/profileRoutes"
import adminContestRoutes from "./presentation/routes/admin/contestRoutes"
import userContestRoutes from './presentation/routes/user/contestRoutes';
import coinsRoute from './presentation/routes/user/coinRoutes'
import roomRoutes from './presentation/routes/user/roomRoutes';
import storeRoutes from "./presentation/routes/user/storeRoutes"
import { errorMiddleware } from './presentation/middleware/errorMiddleware';


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




app.use('/api/health', healthRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/user', profileRoutes);

app.use('/api/user/problems', userProblemRoutes);

app.use('/api/user/contests', userContestRoutes)

app.use('/api/user/rooms', roomRoutes);

app.use('/api/user/coins', coinsRoute);

app.use('/api/user/store', storeRoutes);

app.use('/api/admin/problems', adminProblemRoutes);

app.use('/api/admin/contests', adminContestRoutes)

// app.use('/*',(req,res)=> res.send("no route match"))


app.use(errorMiddleware);



export { app };


