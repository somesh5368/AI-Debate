import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { pragmaticModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

export const createPragmaticNode = (customModel = null) => {
  const model = customModel || pragmaticModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing pragmaticNode (OpenAI)');
    try {
      if (!model) {
        throw new Error('OpenAI API key missing or invalid');
      }

      const systemPrompt = `You are a Practical Strategist (OpenAI). State 2 concise practical steps for this topic (max 40 words total). No fluff.`;

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(state.topic),
      ]);

      const content = typeof response === 'string' ? response : response.content;
      return { pragmatic: content.trim() };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'pragmaticNode',
        message: 'pragmaticNode execution failed',
        error: err,
      });

      return {
        pragmatic: `[OpenAI steps unavailable]`,
        notices: ['OpenAI ChatGPT (OPENAI_API_KEY)'],
      };
    }
  };
};

export const pragmaticNode = createPragmaticNode();
