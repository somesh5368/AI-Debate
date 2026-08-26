import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { strategicModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

export const createStrategicNode = (customModel = null) => {
  const model = customModel || strategicModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing strategicNode (Anthropic Claude - Strategy & Nuance)');
    try {
      if (!model) {
        throw new Error('No valid LLM client available for strategicNode');
      }

      const systemPrompt = `You are a Strategic Advisor (Anthropic Claude).
Given a user's decision, comparison, or dilemma, analyze the long-term positioning, second-order effects, and subtle strategic nuances.

STRICT RULES:
1. ZERO FILL-IN-THE-BLANK TEMPLATES. Do NOT write generic text like "Strategic alignment for [topic]".
2. Identify 2-3 specific long-term trade-offs, ecosystem trajectories, or strategic positioning advantages tailored strictly to this topic.
3. Synthesize how this decision plays out over a 2-5 year horizon.
4. Keep output under 150 words (2-3 concrete bullet points). No fluff.`;

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
        message: 'strategicNode execution failed; applying resilient fallback',
        error: err,
      });

      return {
        strategic: `[Strategic Perspective temporarily unavailable due to API rate limit / model response error.]`,
      };
    }
  };
};

export const strategicNode = createStrategicNode();
