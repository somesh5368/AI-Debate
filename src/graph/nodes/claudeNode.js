import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

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
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            maxOutputTokens: 180, // Token cost control
            temperature: 0.7,
          },
        });

        const prompt = `You are Anthropic Claude. Provide a STRATEGIC, NUANCED, HIGH-LEVEL perspective on this dilemma.
Synthesize long-term positioning in 2 thoughtful points (max 70 words total).

Dilemma: ${state.topic}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('claudeNode API call timed out after 8s')), 8000)
        );

        const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
        return { claudeOpinion: result.response.text().trim() };
      }

      return {
        claudeOpinion: `• Strategic Positioning: Aligns with long-term technological shifts.\n• Nuanced Balance: Synergizes best when paired with complementary domain skills.`,
      };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'claudeNode',
        message: 'Node execution failed or timed out; applying resilient fallback',
        error: err,
      });

      return {
        claudeOpinion: `• Strategic Positioning: ${state.topic} builds long-term career adaptability.\n• Sustainability: Focus on deep mastery rather than superficial familiarity.`,
      };
    }
  };
};

export const claudeNode = createClaudeNode();
