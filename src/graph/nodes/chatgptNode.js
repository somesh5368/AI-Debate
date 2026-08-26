import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export const createChatGPTNode = (customModel = null) => {
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing chatgptNode (Pragmatic & Structured)');
    try {
      if (customModel) {
        const res = await customModel.invoke(state.topic);
        return { chatgptOpinion: typeof res === 'string' ? res : res.content };
      }

      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are ChatGPT (OpenAI). Provide a PRAGMATIC, STRUCTURED, STEP-BY-STEP perspective on this dilemma.
Focus on practical execution, framework, and productivity gains.
Provide 2-3 structured points.

Dilemma: ${state.topic}`;

        const result = await model.generateContent(prompt);
        return { chatgptOpinion: result.response.text().trim() };
      }

      return {
        chatgptOpinion: `• Framework: Break down your goal into 30-day execution sprints.\n• Pragmatic Execution: Focus on building practical projects over theoretical study.\n• Career ROI: High versatility across multiple tech sectors.`,
      };
    } catch (err) {
      logger.warn({ err: err.message }, 'chatgptNode failed, using fallback');
      return {
        chatgptOpinion: `• Practical Step 1: Start with hands-on practice projects for ${state.topic}.\n• Framework: Follow a structured 30-day learning curriculum.\n• Productivity Gain: Unlocks rapid prototyping and immediate portfolio building.`,
      };
    }
  };
};

export const chatgptNode = createChatGPTNode();
