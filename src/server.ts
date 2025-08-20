import { app } from './app';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI ?? '';

mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ KoodeCode backend running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ DB connection error:', err);
        process.exit(1);
    });
