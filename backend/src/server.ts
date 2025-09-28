import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import path from 'path';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Import middleware
import { validateEnvironment } from './config/environment';
import { auditMiddleware } from './middleware/audit';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import analyticsRoutes from './routes/analytics';
import appointmentRoutes from './routes/appointments';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import integrationRoutes from './routes/integrations';
import locationRoutes from './routes/locations';
import patientRoutes from './routes/patients';
import practiceRoutes from './routes/practices';
import userRoutes from './routes/users';
import widgetRoutes from './routes/widgets';
import analyticsRoutes from './routes/analytics';
import reportRoutes from './routes/reports';

// Import services
import { DatabaseService } from './services/database';
import { RedisService } from './services/redis';
import { setupSocketHandlers } from './services/socket';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnvironment();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await DatabaseService.getInstance().checkHealth();

    // Check Redis connection
    const redisStatus = await RedisService.getInstance().checkHealth();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        redis: redisStatus ? 'connected' : 'disconnected',
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    res.json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
    });
  }
});

// API Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  logger.warn('Swagger documentation not found');
}

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/dashboard', authMiddleware, auditMiddleware, dashboardRoutes);
app.use('/api/practices', authMiddleware, auditMiddleware, practiceRoutes);
app.use('/api/locations', authMiddleware, auditMiddleware, locationRoutes);
app.use('/api/integrations', authMiddleware, auditMiddleware, integrationRoutes);
app.use('/api/patients', authMiddleware, auditMiddleware, patientRoutes);
app.use('/api/appointments', authMiddleware, auditMiddleware, appointmentRoutes);
app.use('/api/users', authMiddleware, auditMiddleware, userRoutes);
app.use('/api/widgets', authMiddleware, auditMiddleware, widgetRoutes);
app.use('/api/analytics', authMiddleware, auditMiddleware, analyticsRoutes);
app.use('/api/reports', authMiddleware, auditMiddleware, reportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Socket.IO setup
setupSocketHandlers(io);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  server.close(() => {
    logger.info('HTTP server closed');
  });

  try {
    await DatabaseService.getInstance().close();
    await RedisService.getInstance().close();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }

  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');

  server.close(() => {
    logger.info('HTTP server closed');
  });

  try {
    await DatabaseService.getInstance().close();
    await RedisService.getInstance().close();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }

  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Initialize database connection
    await DatabaseService.getInstance().initialize();
    logger.info('Database connected successfully');

    // Initialize Redis connection
    await RedisService.getInstance().initialize();
    logger.info('Redis connected successfully');

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
      logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

export { app, io, server };
export default app;
