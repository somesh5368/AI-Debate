import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { factualModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

export const createFactualNode = (customModel = null) => {
  const model = customModel || factualModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing factualNode (Google Gemini)');
    try {
      if (!model) {
        throw new Error('Google Gemini API key missing or invalid');
      }

      const systemPrompt = `You are a Factual Data Analyst (Gemini). State 2 concise verifiable facts/data points about this topic (max 40 words total). No fluff.`;

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(state.topic),
      ]);

      const content = typeof response === 'string' ? response : response.content;
      return { factual: content.trim() };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'factualNode',
        message: 'factualNode execution failed',
        error: err,
      });

      return {
        factual: `[Gemini facts unavailable]`,
        notices: ['Google Gemini (GEMINI_API_KEY)'],
      };
    }
  };
};

export const factualNode = createFactualNode();
