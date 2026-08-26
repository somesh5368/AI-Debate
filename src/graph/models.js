import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGroq } from '@langchain/groq';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// API Keys resolution
const anthropicKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const googleKey = env.GOOGLE_API_KEY || env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const groqKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY;

/**
 * 1. Factual Node Model: Google Gemini (gemini-1.5-flash) - Max 120 Tokens
 */
export const factualModel = googleKey
  ? new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: googleKey,
      temperature: 0.2,
      maxOutputTokens: 120,
    })
  : null;

/**
 * 2. Pragmatic Node Model: OpenAI (gpt-4o-mini) - Max 120 Tokens
 */
export const pragmaticModel = openaiKey
  ? new ChatOpenAI({
      model: 'gpt-4o-mini',
      openAIApiKey: openaiKey,
      temperature: 0.4,
      maxTokens: 120,
    })
  : googleKey
  ? new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: googleKey,
      temperature: 0.4,
      maxOutputTokens: 120,
    })
  : null;

/**
 * 3. Critical Node Model: Groq (llama-3.3-70b-versatile) - Max 120 Tokens
 */
export const criticalModel = groqKey
  ? new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      apiKey: groqKey,
      temperature: 0.5,
      maxTokens: 120,
    })
  : googleKey
  ? new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: googleKey,
      temperature: 0.5,
      maxOutputTokens: 120,
    })
  : null;

/**
 * 4. Strategic Node Model: Anthropic Claude (claude-3-5-sonnet-latest) - Max 120 Tokens
 */
export const strategicModel = anthropicKey
  ? new ChatAnthropic({
      model: 'claude-3-5-sonnet-latest',
      anthropicApiKey: anthropicKey,
      temperature: 0.5,
      maxTokens: 120,
    })
  : googleKey
  ? new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: googleKey,
      temperature: 0.5,
      maxOutputTokens: 120,
    })
  : null;

/**
 * 5. Supreme Judge Model: Anthropic Claude (claude-3-5-sonnet-latest) - Max 180 Tokens
 */
export const judgeModel = anthropicKey
  ? new ChatAnthropic({
      model: 'claude-3-5-sonnet-latest',
      anthropicApiKey: anthropicKey,
      temperature: 0.3,
      maxTokens: 180,
    })
  : googleKey
  ? new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: googleKey,
      temperature: 0.3,
      maxOutputTokens: 180,
    })
  : null;

logger.info(
  {
    hasAnthropic: Boolean(anthropicKey),
    hasGoogle: Boolean(googleKey),
    hasOpenAI: Boolean(openaiKey),
    hasGroq: Boolean(groqKey),
  },
  'Multi-Model Providers Initialized (Low Token Budgeting Active)'
);
