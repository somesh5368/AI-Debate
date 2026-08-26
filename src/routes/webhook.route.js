import { Router } from 'express';
import { handleWebhook } from '../controllers/webhook.controller.js';
import { validateTwilioRequest } from '../middleware/validateTwilioRequest.js';

const router = Router();

// Health check endpoint for uptime monitors / Render / Railway
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Twilio WhatsApp Webhook Endpoint
router.post('/webhook', validateTwilioRequest, handleWebhook);

export default router;
