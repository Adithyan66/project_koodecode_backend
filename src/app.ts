import express from 'express';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';

dotenv.config();

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

// TODO: import and use routers here (e.g., app.use('/api/users', userRouter))

// Example health check endpoint
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'koodecode-backend' }));

// Centralized error handler placeholder
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

export { app };

