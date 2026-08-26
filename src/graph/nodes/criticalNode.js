import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { criticalModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

export const createCriticalNode = (customModel = null) => {
  const model = customModel || criticalModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing criticalNode (Groq - Risk & Critic)');
    try {
      if (!model) {
        throw new Error('No valid LLM client available for criticalNode');
      }

      const systemPrompt = `You are a Critical Risk Analyst & Skeptic (Groq / Llama).
Given a user's decision, comparison, or dilemma, expose the specific risks, hidden failure points, downsides, and trade-offs that people frequently overlook.

STRICT RULES:
1. ZERO FILL-IN-THE-BLANK TEMPLATES. Do NOT write generic text like "High risk for [topic]".
2. Identify 2-3 specific failure points, maintenance traps, hidden costs, or competitive downsides unique to this topic.
3. Be sharp, direct, and unsparing. Point out what could go wrong in practice.
4. Keep output under 150 words (2-3 concrete bullet points). No fluff.`;

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
        message: 'criticalNode execution failed; applying resilient fallback',
        error: err,
      });

      return {
        critical: `[Critical Risk Perspective temporarily unavailable due to API rate limit / model response error.]`,
      };
    }
  };
};

export const criticalNode = createCriticalNode();
