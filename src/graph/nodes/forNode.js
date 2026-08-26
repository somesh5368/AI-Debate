import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatAnthropic } from '@langchain/anthropic';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

/**
 * Creates a forNode function supporting Google Gemini (when GEMINI_API_KEY is present)
 * or Anthropic Claude (fallback/customModel).
 */
export const createForNode = (customModel = null) => {
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (geminiKey && !customModel) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    return async (state) => {
      logger.info({ topic: state.topic }, 'Executing forNode via Google Gemini');
      try {
        const prompt = `You are a sharp, persuasive advocate presenting the strongest possible case IN FAVOR of a user's decision or dilemma.
Rules:
1. Present 3 to 4 clear, compelling bullet points advocating FOR the topic.
2. Do NOT hedge, express doubt, or mention arguments against.
3. Keep your response punchy and concise (under 250 words).

Decision / Dilemma: ${state.topic}`;

        const result = await geminiModel.generateContent(prompt);
        const text = result.response.text();
        return { forArgument: text };
      } catch (err) {
        logger.warn({ err: err.message }, 'forNode Gemini call failed, using fallback');
        return {
          forArgument: `• Strong potential for long-term growth and success with ${state.topic}.\n• High flexibility, modern opportunities, and industry alignment.\n• Expands capabilities and opens valuable strategic pathways.`,
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
      `You are a sharp, persuasive advocate presenting the strongest possible case IN FAVOR of a user's decision or dilemma.
Rules:
1. Present 3 to 4 clear, compelling bullet points advocating FOR the topic.
2. Do NOT hedge, express doubt, or mention arguments against.
3. Keep your response punchy and concise (under 250 words).`,
    ],
    ['human', 'Decision / Dilemma: {topic}'],
  ]);

  const chain = prompt.pipe(model);

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing forNode via Anthropic Claude');
    try {
      const response = await chain.invoke({ topic: state.topic });
      const content = typeof response === 'string' ? response : response.content;
      return {
        forArgument: typeof content === 'string' ? content : JSON.stringify(content),
      };
    } catch (err) {
      logger.warn({ err: err.message }, 'forNode API call failed, using fallback argument');
      return {
        forArgument: `• Strong potential for long-term growth and success with ${state.topic}.\n• High flexibility, modern opportunities, and industry alignment.\n• Expands capabilities and opens valuable strategic pathways.`,
      };
    }
  };
};

export const forNode = createForNode();
