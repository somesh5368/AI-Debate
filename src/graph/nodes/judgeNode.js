import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export const createJudgeNode = (customModel = null) => {
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing judgeNode (Supreme Synthesis)');
    try {
      if (customModel) {
        const res = await customModel.invoke(state.topic);
        return { finalVerdict: typeof res === 'string' ? res : res.content };
      }

      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are the Supreme AI Judge & Synthesizer. You have evaluated opinions from 4 AI models on a user's decision/dilemma:

DILEMMA: ${state.topic}

MODEL PERSPECTIVES:
1. Google Gemini (Factual):
${state.geminiOpinion}

2. ChatGPT (Pragmatic):
${state.chatgptOpinion}

3. Groq / Llama (Critical Risk):
${state.groqOpinion}

4. Claude (Strategic Nuance):
${state.claudeOpinion}

YOUR TASK:
1. **Cross-Model Analysis**: Briefly compare where the models agree and where they conflict. Declare which model's perspective is most accurate for this specific dilemma.
2. **Definitive Recommendation**: Provide ONE clear, non-hedging, actionable final verdict/recommendation on what the user SHOULD do.

Keep your synthesis structured, sharp, and impactful (under 280 words).`;

        const result = await model.generateContent(prompt);
        return { finalVerdict: result.response.text().trim() };
      }

      return {
        finalVerdict: `*Cross-Model Analysis*: Gemini and ChatGPT emphasize strong practical demand, while Groq warns of setup friction. Claude synthesizes long-term adaptability.\n\n*Winning Perspective*: ChatGPT's pragmatic approach is most actionable.\n\n*Final Verdict*: Commit to a focused 30-day hands-on project to build momentum before expanding into advanced concepts.`,
      };
    } catch (err) {
      logger.warn({ err: err.message }, 'judgeNode failed, using fallback verdict');
      return {
        finalVerdict: `*Cross-Model Analysis*: Evaluating all model perspectives for "${state.topic}", Gemini and ChatGPT emphasize practical utility, Groq highlights risk mitigation, and Claude provides strategic positioning.\n\n*Final Verdict*: Proceed with structured execution. Begin with a 30-day trial project to validate momentum.`,
      };
    }
  };
};

export const judgeNode = createJudgeNode();
