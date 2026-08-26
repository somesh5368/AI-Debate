import { logger } from '../utils/logger.js';
import { createTwimlResponse } from '../services/formatter.js';
import { alertService } from '../services/alertService.js';

/**
 * Centralized Express Error Handler Middleware.
 * Catches unhandled errors during request processing, triggers critical alerts, and sends a graceful TwiML fallback.
 */
export const errorHandler = async (err, req, res, _next) => {
  logger.error(
    {
      err: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
    'Unhandled request error in Express pipeline'
  );

  // Trigger high-priority alert
  await alertService.triggerAlert({
    level: 'CRITICAL',
    source: 'ExpressErrorHandler',
    message: `Unhandled error processing path ${req.path}`,
    error: err,
  });

  const fallbackText =
    '⚠️ *AI Debate Bot Notice*\n\nSorry, I ran into an error while processing your request. Please try again in a moment.';

  res.header('Content-Type', 'text/xml');
  return res.status(200).send(createTwimlResponse(fallbackText));
};
