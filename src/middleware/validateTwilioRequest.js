import twilio from 'twilio';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const validateTwilioRequest = (req, res, next) => {
  if (
    env.DISABLE_TWILIO_VALIDATION ||
    process.env.DISABLE_TWILIO_VALIDATION === 'true' ||
    process.env.DISABLE_TWILIO_VALIDATION === '1' ||
    env.NODE_ENV === 'test'
  ) {
    logger.info('Skipping Twilio signature validation for local testing');
    return next();
  }

  const twilioAuthToken = env.TWILIO_AUTH_TOKEN;
  if (!twilioAuthToken) {
    logger.warn('TWILIO_AUTH_TOKEN is not set; skipping signature validation');
    return next();
  }

  const twilioSignature = req.headers['x-twilio-signature'];
  if (!twilioSignature) {
    logger.error('Missing X-Twilio-Signature header');
    return res.status(403).send('Forbidden: Missing X-Twilio-Signature header');
  }

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const url = `${protocol}://${host}${req.originalUrl}`;

  const isValid = twilio.validateRequest(
    twilioAuthToken,
    twilioSignature,
    url,
    req.body || {}
  );

  if (!isValid) {
    logger.error({ url }, 'Invalid Twilio signature');
    return res.status(403).send('Forbidden: Invalid Twilio signature');
  }

  next();
};
