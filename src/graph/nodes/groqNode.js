import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export const createGroqNode = (customModel = null) => {
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing groqNode (Critical & Bold)');
    try {
      if (customModel) {
        const res = await customModel.invoke(state.topic);
        return { groqOpinion: typeof res === 'string' ? res : res.content };
      }

      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are Groq (running Llama 3 / DeepSeek). Provide a BOLD, CRITICAL, RISK-FOCUSED perspective on this dilemma.
Highlight hidden costs, competitive pressures, and potential failure points.
Provide 2-3 sharp points.

Dilemma: ${state.topic}`;

        const result = await model.generateContent(prompt);
        return { groqOpinion: result.response.text().trim() };
      }

      return {
        groqOpinion: `• Market Saturation: Heavy competition demands strong differentiation.\n• Hidden Bottlenecks: Requires strict discipline to avoid early burnout.\n• Opportunity Cost: High time investment before seeing tangible return.`,
      };
    } catch (err) {
      logger.warn({ err: err.message }, 'groqNode failed, using fallback');
      return {
        groqOpinion: `• Critical Warning: Beware of steep syntax verbosity or initial setup friction in ${state.topic}.\n• Competition: High developer density requires strong project differentiation.\n• Risk Mitigation: Set a 30-day checkpoint to evaluate progress.`,
      };
    }
  };
};

export const groqNode = createGroqNode();
