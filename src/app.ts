import express from 'express';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import cors from "cors"

import authRoutes from './presentation/routes/authRoutes';

import adminProblemRoutes from './presentation/routes/admin/problemRoutes';

import userProblemRoutes from './presentation/routes/user/problemRoutes';

import cookieParser from "cookie-parser";



dotenv.config();

const app = express();


app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(json());

app.use(urlencoded({ extended: true }));


app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'koodecode-backend' }));




app.use('/api/auth', authRoutes);




app.use('/api/admin/problems', adminProblemRoutes);




app.use('/api/user/problems', userProblemRoutes);



app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

export { app };


