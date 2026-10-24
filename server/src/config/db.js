import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Uses environment variable MONGO_URI with a fallback to local MongoDB instance
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusgeeks';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.warn('[Database Notice] If MongoDB is not running locally, make sure to start the MongoDB service or provide a MongoDB Atlas URI in server/.env');
    // Note: In development we don't necessarily want to crash the process immediately
    // so tests or mock modes can still execute if needed.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
