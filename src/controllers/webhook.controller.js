import { debateGraph as defaultDebateGraph } from '../graph/debateGraph.js';
import { formatDebateResponse, createTwimlResponse } from '../services/formatter.js';
import { cacheService } from '../services/cacheService.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Controller factory supporting dependency injection for debateGraph.
 * @param {Object} [customGraph]
 */
export const createWebhookController = (customGraph = null) => {
  const graph = customGraph || defaultDebateGraph;

  return async (req, res, next) => {
    try {
      let rawTopic = req.body?.Body?.trim();
      const from = req.body?.From;
      const profileName = req.body?.ProfileName;

      logger.info({ from, profileName, rawTopic }, 'Received WhatsApp webhook request');

      if (!rawTopic) {
        const welcomeText =
          '👋 *Welcome to the AI Debate Bot!*\n\nPlease send me a decision or dilemma you are facing (e.g., "Should I accept a job offer at a startup vs a large company?").';
        res.header('Content-Type', 'text/xml');
        return res.send(createTwimlResponse(welcomeText));
      }

      // Security & Token Protection: Truncate input if exceeding max length
      const maxInputChars = env.MAX_INPUT_CHARS || 300;
      let topic = rawTopic;
      if (topic.length > maxInputChars) {
        logger.info({ originalLength: topic.length, maxInputChars }, 'Truncating user prompt for token & security protection');
        topic = topic.slice(0, maxInputChars) + '...';
      }

      // Token Cost Optimization: Check cache first
      const cachedState = cacheService.get(topic);
      if (cachedState) {
        const formattedText = formatDebateResponse(cachedState);
        res.header('Content-Type', 'text/xml');
        return res.send(createTwimlResponse(formattedText));
      }

      // Invoke the compiled LangGraph StateGraph
      logger.info({ topic }, 'Invoking debate graph');
      const finalState = await graph.invoke({ topic });

      // Save result in cache for token savings on duplicate queries
      cacheService.set(topic, finalState);

      // Format verdict for WhatsApp
      const formattedText = formatDebateResponse(finalState);
      const twimlXml = createTwimlResponse(formattedText);

      res.header('Content-Type', 'text/xml');
      return res.send(twimlXml);
    } catch (error) {
      next(error);
    }
  };
};

export const handleWebhook = createWebhookController();
