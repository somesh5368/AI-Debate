import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { factualModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

export const createFactualNode = (customModel = null) => {
  const model = customModel || factualModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing factualNode (Google Gemini - Facts & Specs)');
    try {
      if (!model) {
        throw new Error('No valid LLM client available for factualNode');
      }

      const systemPrompt = `You are an expert Factual Data Analyst (Google Gemini).
Given a user's decision, comparison, or dilemma, analyze the SPECIFIC content of the question.

STRICT RULES:
1. ZERO FILL-IN-THE-BLANK TEMPLATES. Do NOT write generic sentences with the topic string dropped in (e.g., "High adoption rate for [topic]").
2. Identify 2-3 concrete, verifiable facts, technical specs, numbers, prices, or hard industry data points that bear directly on this specific topic.
3. If analyzing cars, talk actual engines/safety NCAP ratings/EV ranges. If analyzing tech stack, talk actual performance/ecosystem/jobs. If analyzing a career/life decision, talk actual market salary/statistics/timelines.
4. Keep output under 150 words (2-3 concrete bullet points). No fluff.`;

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
        message: 'factualNode execution failed; applying resilient fallback',
        error: err,
      });

      return {
        factual: `[Factual Data Perspective temporarily unavailable due to API rate limit / model response error.]`,
      };
    }
  };
};

export const factualNode = createFactualNode();
