import { logger } from '../utils/logger.js';
import { createTwimlResponse } from '../services/formatter.js';

/**
 * Centralized Express Error Handler Middleware.
 * Catches unhandled errors during request processing and sends a graceful TwiML fallback.
 */
export const errorHandler = (err, req, res, _next) => {
  logger.error(
    {
      err: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
    'Unhandled request error in Express pipeline'
  );

  const fallbackText =
    '⚠️ *AI Debate Bot Notice*\n\nSorry, I ran into an error while processing your request. Please try again in a moment.';

  res.header('Content-Type', 'text/xml');
  return res.status(200).send(createTwimlResponse(fallbackText));
};
