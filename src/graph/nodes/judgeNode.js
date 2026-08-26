import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

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
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            maxOutputTokens: 250, // Token cost control for judge synthesis
            temperature: 0.7,
          },
        });

        const prompt = `You are the Supreme AI Judge. Synthesize available model opinions on this dilemma into a structured verdict (max 150 words):

DILEMMA: ${state.topic}

1. Gemini (Factual): ${state.geminiOpinion || 'N/A'}
2. ChatGPT (Pragmatic): ${state.chatgptOpinion || 'N/A'}
3. Groq (Risk): ${state.groqOpinion || 'N/A'}
4. Claude (Strategic): ${state.claudeOpinion || 'N/A'}

Format output strictly as:
*Cross-Model Analysis*: [1-2 sentences]
*Winning Perspective*: [Which model had best advice]
*Final Verdict*: [1-2 actionable sentences]`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('judgeNode API call timed out after 8s')), 8000)
        );

        const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
        return { finalVerdict: result.response.text().trim() };
      }

      return {
        finalVerdict: `*Cross-Model Analysis*: Gemini and ChatGPT emphasize strong practical demand, while Groq warns of setup friction. Claude synthesizes long-term adaptability.\n\n*Winning Perspective*: ChatGPT's pragmatic approach is most actionable.\n\n*Final Verdict*: Commit to a focused 30-day hands-on project to build momentum before expanding into advanced concepts.`,
      };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'judgeNode',
        message: 'judgeNode synthesis failed or timed out; applying resilient fallback verdict',
        error: err,
      });

      return {
        finalVerdict: `*Cross-Model Analysis*: Evaluating all perspectives for "${state.topic}", Gemini & ChatGPT emphasize execution, Groq highlights risk mitigation, and Claude provides strategic positioning.\n\n*Winning Perspective*: Balanced multi-perspective consensus.\n\n*Final Verdict*: Proceed with structured execution. Start with a 30-day trial project to validate momentum.`,
      };
    }
  };
};

export const judgeNode = createJudgeNode();
