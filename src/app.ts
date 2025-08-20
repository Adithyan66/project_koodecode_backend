import express from 'express';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import cors from "cors"

import authRoutes from './presentation/routes/authRoutes';

dotenv.config();

const app = express();

app.use(cors())

app.use(json());
app.use(urlencoded({ extended: true }));



app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'koodecode-backend' }));

app.use('/auth', authRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

export { app };


