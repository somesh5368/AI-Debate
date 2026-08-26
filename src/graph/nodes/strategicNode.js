import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { strategicModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

export const createStrategicNode = (customModel = null) => {
  const model = customModel || strategicModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing strategicNode (Anthropic Claude)');
    try {
      if (!model) {
        throw new Error('Anthropic API key missing or invalid');
      }

      const systemPrompt = `You are a Strategic Advisor (Claude). State 2 concise long-term tradeoffs for this topic (max 40 words total). No fluff.`;

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(state.topic),
      ]);

      const content = typeof response === 'string' ? response : response.content;
      return { strategic: content.trim() };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'strategicNode',
        message: 'strategicNode execution failed',
        error: err,
      });

      return {
        strategic: `[Claude tradeoffs unavailable]`,
        notices: ['Anthropic Claude (ANTHROPIC_API_KEY)'],
      };
    }
  };
};

export const strategicNode = createStrategicNode();
