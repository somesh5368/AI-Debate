import { ChatAnthropic } from '@langchain/anthropic';
import { env } from '../config/env.js';

// Shared model instance — nodes import this instead of each creating
// their own, so timeout/model config stays in one place.
export const model = new ChatAnthropic({
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 400,
  timeout: 10000, // 10s per call — keeps total request well under Twilio's 15s webhook limit
  anthropicApiKey: env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || 'dummy_key_for_init',
});