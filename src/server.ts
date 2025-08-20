import { app } from './app';

import { connectDB } from './infrastructure/db/mongoConnection';

const PORT = process.env.PORT;


connectDB()

app.listen(PORT, () => {
    console.log(`✅ KoodeCode backend running at http://localhost:${PORT}`);
});


