import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

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
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            maxOutputTokens: 180, // Token cost control
            temperature: 0.7,
          },
        });

        const prompt = `You are ChatGPT (OpenAI). Provide a PRAGMATIC, STRUCTURED, STEP-BY-STEP perspective on this dilemma.
Provide 2 concise structured points (max 70 words total).

Dilemma: ${state.topic}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('chatgptNode API call timed out after 8s')), 8000)
        );

        const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
        return { chatgptOpinion: result.response.text().trim() };
      }

      return {
        chatgptOpinion: `• Framework: Break down your goal into 30-day execution sprints.\n• Pragmatic Execution: Focus on building practical projects over theoretical study.`,
      };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'chatgptNode',
        message: 'Node execution failed or timed out; applying resilient fallback',
        error: err,
      });

      return {
        chatgptOpinion: `• Practical Step 1: Start with hands-on practice projects for ${state.topic}.\n• Framework: Follow a structured 30-day learning curriculum.`,
      };
    }
  };
};

export const chatgptNode = createChatGPTNode();
