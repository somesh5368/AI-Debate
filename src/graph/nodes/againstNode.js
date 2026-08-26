import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatAnthropic } from '@langchain/anthropic';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

/**
 * Creates an againstNode function supporting Google Gemini (when GEMINI_API_KEY is present)
 * or Anthropic Claude (fallback/customModel).
 */
export const createAgainstNode = (customModel = null) => {
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (geminiKey && !customModel) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    return async (state) => {
      logger.info({ topic: state.topic }, 'Executing againstNode via Google Gemini');
      try {
        const prompt = `You are a sharp, skeptical critic presenting the strongest possible case AGAINST a user's decision or dilemma.
Rules:
1. Present 3 to 4 clear, compelling bullet points advocating AGAINST the topic.
2. Do NOT hedge, validate the decision, or mention arguments for.
3. Keep your response punchy and concise (under 250 words).

Decision / Dilemma: ${state.topic}`;

        const result = await geminiModel.generateContent(prompt);
        const text = result.response.text();
        return { againstArgument: text };
      } catch (err) {
        logger.warn({ err: err.message }, 'againstNode Gemini call failed, using fallback');
        return {
          againstArgument: `• Increased risk, uncertainty, or steep initial learning curve.\n• Higher resource commitment and potential opportunity cost.\n• Requires careful risk management before taking full action on ${state.topic}.`,
        };
      }
    };
  }

  const model =
    customModel ||
    new ChatAnthropic({
      model: 'claude-3-5-sonnet-latest',
      anthropicApiKey: env.ANTHROPIC_API_KEY || 'dummy_key_for_init',
      maxTokens: 400,
      timeout: 10000,
    });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a sharp, skeptical critic presenting the strongest possible case AGAINST a user's decision or dilemma.
Rules:
1. Present 3 to 4 clear, compelling bullet points advocating AGAINST the topic.
2. Do NOT hedge, validate the decision, or mention arguments for.
3. Keep your response punchy and concise (under 250 words).`,
    ],
    ['human', 'Decision / Dilemma: {topic}'],
  ]);

  const chain = prompt.pipe(model);

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing againstNode via Anthropic Claude');
    try {
      const response = await chain.invoke({ topic: state.topic });
      const content = typeof response === 'string' ? response : response.content;
      return {
        againstArgument: typeof content === 'string' ? content : JSON.stringify(content),
      };
    } catch (err) {
      logger.warn({ err: err.message }, 'againstNode API call failed, using fallback argument');
      return {
        againstArgument: `• Increased risk, uncertainty, or steep initial learning curve.\n• Higher resource commitment and potential opportunity cost.\n• Requires careful risk management before taking full action on ${state.topic}.`,
      };
    }
  };
};

export const againstNode = createAgainstNode();
