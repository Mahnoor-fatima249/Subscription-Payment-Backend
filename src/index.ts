import app from './server';
import config from './config';
import logger from './utils/logger';
import prisma from './utils/prisma';
import { DunningService } from './services/dunning.service';
import { WebhookService } from './services/webhook.service';

const PORT = config.port;

async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.env} mode`);
      logger.info(`API available at http://localhost:${PORT}/api/${config.apiVersion}`);
    });

    // Schedule dunning job (every hour)
    setInterval(async () => {
      try {
        logger.info('Running dunning process...');
        const results = await DunningService.processFailedPayments();
        logger.info(`Dunning completed: ${results.filter(r => r.success).length} succeeded, ${results.filter(r => !r.success).length} failed`);
      } catch (error) {
        logger.error('Dunning process failed:', error);
      }
    }, 60 * 60 * 1000);

    // Schedule webhook retry (every 5 minutes)
    setInterval(async () => {
      try {
        await WebhookService.retryFailedWebhooks();
      } catch (error) {
        logger.error('Webhook retry failed:', error);
      }
    }, 5 * 60 * 1000);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected');
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();