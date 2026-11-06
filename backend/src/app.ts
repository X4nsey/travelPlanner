import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tripRoutes from './routes/trip.routes';
import eventRoutes from './routes/event.routes';
import countryRoutes from './routes/country.routes';
import favoriteRoutes from './routes/favorite.routes';
import { errorHandler } from './middleware/error.middleware';
import { AppError } from './lib/errors';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration restricted to trusted frontend origin(s)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl / same-origin requests with no origin header
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new AppError('Доступ с данного источника запрещён политикой CORS', 403, 'CORS_FORBIDDEN'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Healthcheck endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'TravelPlanner API',
      timestamp: new Date().toISOString(),
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/favorites', favoriteRoutes);

// 404 handler for unknown API routes
app.use((_req, _res, next) => {
  next(new AppError('Запрашиваемый ресурс API не найден', 404, 'NOT_FOUND'));
});

// Global error handler
app.use(errorHandler);

export default app;
