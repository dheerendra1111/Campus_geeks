import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Enable CORS with credentials for cookie handling
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
  })
);

// Standard body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CampusGeeks API - Peer-to-Peer Campus Resource Sharing Hub',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      items: '/api/items',
      requests: '/api/requests',
      reviews: '/api/reviews'
    }
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(1)}s`,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 Not Found & Central Error Handler
app.use(notFound);
app.use(errorHandler);

export default app;
