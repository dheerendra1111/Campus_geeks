import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database & start listening
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Server] CampusGeeks backend running on http://localhost:${PORT}`);
    console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
  });
};

startServer();
