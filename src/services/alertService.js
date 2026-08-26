import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Alert Service for handling high-priority failure and rate-limit notifications.
 */
export const alertService = {
  /**
   * Triggers an alert when a node or service fails.
   * @param {Object} params
   * @param {string} params.level - 'CRITICAL' | 'WARNING' | 'INFO'
   * @param {string} params.source - Module or Node name (e.g. 'geminiNode')
   * @param {string} params.message - Human readable alert message
   * @param {Error|Object} [params.error] - Associated error details
   */
  async triggerAlert({ level = 'WARNING', source, message, error = null }) {
    const errorDetails = error ? error.message || String(error) : 'N/A';
    const alertFormatted = `🚨 [ALERT - ${level}] [${source}]: ${message} (Error: ${errorDetails})`;

    if (level === 'CRITICAL') {
      logger.error({ source, message, error: errorDetails }, alertFormatted);
    } else {
      logger.warn({ source, message, error: errorDetails }, alertFormatted);
    }

    // Optional Webhook Alerting (e.g. Slack/Discord)
    if (env.ALERT_WEBHOOK_URL && env.NODE_ENV !== 'test') {
      try {
        await fetch(env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: alertFormatted,
            text: alertFormatted,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (webhookErr) {
        logger.error({ err: webhookErr.message }, 'Failed to send alert webhook');
      }
    }
  },
};
