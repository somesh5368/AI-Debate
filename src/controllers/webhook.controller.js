import { debateGraph as defaultDebateGraph } from '../graph/debateGraph.js';
import { formatDebateResponse, createTwimlResponse } from '../services/formatter.js';
import { logger } from '../utils/logger.js';

/**
 * Controller factory supporting dependency injection for debateGraph.
 * @param {Object} [customGraph]
 */
export const createWebhookController = (customGraph = null) => {
  const graph = customGraph || defaultDebateGraph;

  return async (req, res, next) => {
    try {
      const topic = req.body?.Body?.trim();
      const from = req.body?.From;
      const profileName = req.body?.ProfileName;

      logger.info({ from, profileName, topic }, 'Received WhatsApp webhook request');

      if (!topic) {
        const welcomeText =
          '👋 *Welcome to the AI Debate Bot!*\n\nPlease send me a decision or dilemma you are facing (e.g., "Should I accept a job offer at a startup vs a large company?").';
        res.header('Content-Type', 'text/xml');
        return res.send(createTwimlResponse(welcomeText));
      }

      // Invoke the compiled LangGraph StateGraph
      logger.info({ topic }, 'Invoking debate graph');
      const finalState = await graph.invoke({ topic });

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
