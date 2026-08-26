import express from 'express';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import routes from './routes/webhook.route.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Middleware for parsing form-encoded bodies (Twilio webhook payloads)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/', routes);

// Centralized error handling middleware
app.use(errorHandler);

if (env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    logger.info(`🚀 WhatsApp Debate Bot running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}
