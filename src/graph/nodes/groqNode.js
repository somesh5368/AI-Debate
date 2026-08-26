import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

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
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            maxOutputTokens: 180, // Token cost control
            temperature: 0.7,
          },
        });

        const prompt = `You are Groq (running Llama 3). Provide a BOLD, CRITICAL, RISK-FOCUSED perspective on this dilemma.
Highlight hidden costs and potential failure points in 2 concise points (max 70 words total).

Dilemma: ${state.topic}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('groqNode API call timed out after 8s')), 8000)
        );

        const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
        return { groqOpinion: result.response.text().trim() };
      }

      return {
        groqOpinion: `• Market Saturation: Heavy competition demands strong differentiation.\n• Hidden Bottlenecks: Requires strict discipline to avoid early burnout.`,
      };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'groqNode',
        message: 'Node execution failed or timed out; applying resilient fallback',
        error: err,
      });

      return {
        groqOpinion: `• Critical Warning: Beware of steep setup friction or early burnout in ${state.topic}.\n• Risk Mitigation: Set a 30-day checkpoint to evaluate progress.`,
      };
    }
  };
};

export const groqNode = createGroqNode();
