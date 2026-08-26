import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { criticalModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

export const createCriticalNode = (customModel = null) => {
  const model = customModel || criticalModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing criticalNode (Groq)');
    try {
      if (!model) {
        throw new Error('Groq API key missing or invalid');
      }

      const systemPrompt = `You are a Risk Critic (Groq/Llama). State 2 concise risks or failure points for this topic (max 40 words total). No fluff.`;

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(state.topic),
      ]);

      const content = typeof response === 'string' ? response : response.content;
      return { critical: content.trim() };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'criticalNode',
        message: 'criticalNode execution failed',
        error: err,
      });

      return {
        critical: `[Groq risks unavailable]`,
        notices: ['Groq Llama (GROQ_API_KEY)'],
      };
    }
  };
};

export const criticalNode = createCriticalNode();
