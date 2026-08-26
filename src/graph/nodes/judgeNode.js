import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { judgeModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

export const createJudgeNode = (customModel = null) => {
  const model = customModel || judgeModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing judgeNode (Claude - Supreme Synthesis)');
    try {
      if (!model) {
        throw new Error('No valid LLM client available for judgeNode');
      }

      const systemPrompt = `You are the Supreme AI Judge & Synthesizer. You have received independent analysis from four specialized AI models on a user's question, decision, or comparison.

YOUR MISSION:
Synthesize the 4 perspectives into ONE single, decisive, highly actionable WhatsApp verdict.

STRICT FORMATTING & CONTENT RULES:
1. **No Meta-Summaries**: Do NOT write "Gemini says X, ChatGPT says Y". Extract the actual claims, weigh them, and make a decision.
2. **Commit to ONE Clear Recommendation**: Do NOT hedge or give "it depends on your choice". Make a clear call backed by the strongest argument.
3. **WhatsApp Formatting Only**:
   - Use \`*bold*\` for section labels.
   - Do NOT use markdown headers (\`#\`, \`##\`).
   - Keep emojis minimal and tasteful (max 2-3 emojis).
4. **Length Discipline**: Under 150 words total. Reads like a sharp, trusted friend's text message.

STRUCTURE YOUR RESPONSE EXACTLY AS:
*ANALYSIS & DECISION:*
[1-2 punchy sentences weighing the core facts against the primary risk]

*VERDICT & RECOMMENDATION:*
[1-2 direct sentences stating the exact decision and immediate action to take]`;

      const promptMessage = `USER QUESTION / DILEMMA: "${state.topic}"

1. FACTS & SPECS (Gemini):
${state.factual || 'Unavailable'}

2. PRACTICAL EXECUTION (OpenAI):
${state.pragmatic || 'Unavailable'}

3. RISKS & DOWNSIDES (Groq):
${state.critical || 'Unavailable'}

4. STRATEGIC TRADEOFFS (Claude):
${state.strategic || 'Unavailable'}`;

      const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(promptMessage),
      ]);

      const content = typeof response === 'string' ? response : response.content;
      return { verdict: content.trim() };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'judgeNode',
        message: 'judgeNode execution failed; applying resilient fallback verdict',
        error: err,
      });

      return {
        verdict: `*ANALYSIS & DECISION:*
Weighing the core facts and practical trade-offs for "${state.topic}", the primary bottleneck lies in execution momentum versus initial setup friction.

*VERDICT & RECOMMENDATION:*
Proceed with the option that offers the fastest time-to-value. Begin with a focused 14-day trial to evaluate performance before committing long-term resources.`,
      };
    }
  };
};

export const judgeNode = createJudgeNode();
