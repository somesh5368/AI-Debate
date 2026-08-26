import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { pragmaticModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

export const createPragmaticNode = (customModel = null) => {
  const model = customModel || pragmaticModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing pragmaticNode (OpenAI - Practical Execution)');
    try {
      if (!model) {
        throw new Error('No valid LLM client available for pragmaticNode');
      }

      const systemPrompt = `You are a Practical Execution Strategist (OpenAI).
Given a user's decision, comparison, or dilemma, provide a pragmatic, step-by-step action plan on what a person should ACTUALLY DO.

STRICT RULES:
1. ZERO FILL-IN-THE-BLANK TEMPLATES. Do NOT write generic text like "Step 1: Start projects for [topic]".
2. Give 2-3 specific, actionable steps tailored strictly to the details of the question.
3. Address immediate day-to-day usability, execution effort, workflow, and real-world friction.
4. Keep output under 150 words (2-3 concrete bullet points). No fluff.`;

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
        message: 'pragmaticNode execution failed; applying resilient fallback',
        error: err,
      });

      return {
        pragmatic: `[Pragmatic Execution Perspective temporarily unavailable due to API rate limit / model response error.]`,
      };
    }
  };
};

export const pragmaticNode = createPragmaticNode();
