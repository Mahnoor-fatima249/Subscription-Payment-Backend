import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

import authRoutes from './routes/auth.routes';
import planRoutes from './routes/plan.routes';
import customerRoutes from './routes/customer.routes';
import subscriptionRoutes from './routes/subscription.routes';
import invoiceRoutes from './routes/invoice.routes';
import paymentRoutes from './routes/payment.routes';
import usageRoutes from './routes/usage.routes';
import couponRoutes from './routes/coupon.routes';
import dunningRoutes from './routes/dunning.routes';
import reportingRoutes from './routes/reporting.routes';
import webhookRoutes from './routes/webhook.routes';

const app = express();

// Trust proxy for rate limiting behind load balancer
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing - webhook needs raw body
app.use('/api/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(config.env === 'production' ? 'combined' : 'dev', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/plans`, planRoutes);
app.use(`${apiPrefix}/customers`, customerRoutes);
app.use(`${apiPrefix}/subscriptions`, subscriptionRoutes);
app.use(`${apiPrefix}/invoices`, invoiceRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);
app.use(`${apiPrefix}/usage`, usageRoutes);
app.use(`${apiPrefix}/coupons`, couponRoutes);
app.use(`${apiPrefix}/dunning`, dunningRoutes);
app.use(`${apiPrefix}/reports`, reportingRoutes);
app.use(`${apiPrefix}/webhook`, webhookRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    name: config.app.name,
    version: '1.0.0',
    docs: `${config.app.url}/api-docs`,
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;