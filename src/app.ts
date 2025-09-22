import express from 'express';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import cookieParser from "cookie-parser";
import cors from "cors"


import authRoutes from './presentation/routes/authRoutes';
import adminProblemRoutes from './presentation/routes/admin/problemRoutes'
import userProblemRoutes from './presentation/routes/user/problemRoutes';
import healthRoutes from "./presentation/routes/healthRoutes";
import profileRoutes from "./presentation/routes/user/profileRoutes"
import adminContestRoutes from "./presentation/routes/admin/contestRoutes"
import userContestRoutes from './presentation/routes/user/contestRoutes'
import { ContestTimerService } from './application/services/ContestTimerService';
import { MongoContestRepository } from './infrastructure/db/MongoContestRepository';
import { ContestCron } from './infrastructure/corn/ContestCron';
import { errorMiddleware } from './presentation/middleware/errorMiddleware';


dotenv.config();
const app = express();
app.use(cookieParser());
// app.use(cors({
//   origin: ["http://localhost:5173", 'https://xyz789.ngrok.io'],
//   credentials: true
// }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://7eb979cc030d.ngrok-free.app"
  ],
  credentials: true
}))


app.use(json());
app.use(urlencoded({ extended: true }));

const cornjob = new ContestCron(new ContestTimerService(new MongoContestRepository()))
cornjob.start()



app.use('/api/health', healthRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/user', profileRoutes);

app.use('/api/admin/problems', adminProblemRoutes);

app.use('/api/user/problems', userProblemRoutes);

app.use('/api/admin/contests', adminContestRoutes)

app.use('/api/user/contests', userContestRoutes)

// app.use('/*',(req,res)=> res.send("no route match"))


// app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
//   console.error(err);
//   res.status(500).json({ error: 'Internal server error' });
// });

app.use(errorMiddleware);



export { app };


