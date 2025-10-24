import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Initialize Firebase Admin
admin.initializeApp();

// Import route handlers
import { authRoutes } from './routes/auth';
import { contestRoutes } from './routes/contests';
import { studentRoutes } from './routes/students';
import { adminRoutes } from './routes/admin';
import { rejoinRoutes } from './routes/rejoin';

// Import scheduled functions
import { finalizeContest } from './scheduled/finalizeContest';
import { cleanupSessions } from './scheduled/cleanupSessions';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rejoin', rejoinRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(app);

// Scheduled functions
export { finalizeContest, cleanupSessions };

// HTTP callable functions for real-time operations
export const createStudent = functions.https.onCall(async (data, context) => {
  // Implementation in admin routes
});

export const startContest = functions.https.onCall(async (data, context) => {
  // Implementation in contest routes
});

export const requestRejoin = functions.https.onCall(async (data, context) => {
  // Implementation in rejoin routes
});

export const approveRejoin = functions.https.onCall(async (data, context) => {
  // Implementation in rejoin routes
});
