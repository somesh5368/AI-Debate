import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export const createClaudeNode = (customModel = null) => {
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing claudeNode (Strategic & Nuanced)');
    try {
      if (customModel) {
        const res = await customModel.invoke(state.topic);
        return { claudeOpinion: typeof res === 'string' ? res : res.content };
      }

      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are Anthropic Claude. Provide a STRATEGIC, NUANCED, HIGH-LEVEL perspective on this dilemma.
Synthesize long-term strategic positioning, subtle edge cases, and human alignment.
Provide 2-3 thoughtful points.

Dilemma: ${state.topic}`;

        const result = await model.generateContent(prompt);
        return { claudeOpinion: result.response.text().trim() };
      }

      return {
        claudeOpinion: `• Strategic Positioning: Aligns with long-term technological shifts.\n• Nuanced Balance: Synergizes best when paired with complementary domain skills.\n• Sustainable Maturity: Fosters architectural thinking and deep problem-solving.`,
      };
    } catch (err) {
      logger.warn({ err: err.message }, 'claudeNode failed, using fallback');
      return {
        claudeOpinion: `• Strategic Positioning: ${state.topic} builds long-term career adaptability.\n• Nuanced View: Balance rapid execution with deep foundational understanding.\n• Sustainability: Focus on mastery rather than superficial familiarity.`,
      };
    }
  };
};

export const claudeNode = createClaudeNode();
