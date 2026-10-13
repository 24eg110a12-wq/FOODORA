import { app } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[FOODORA Server] Running on http://localhost:${PORT}`);
    console.log(`[FOODORA Server] Health endpoint: http://localhost:${PORT}/api/v1/health`);
  });
};

startServer();
