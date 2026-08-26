import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ANTHROPIC_API_KEY: z.string().min(1, { message: 'ANTHROPIC_API_KEY is required' }).optional().or(z.literal('')),
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  DISABLE_TWILIO_VALIDATION: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
  ALERT_WEBHOOK_URL: z.string().optional(),
  MAX_INPUT_CHARS: z
    .string()
    .default('300')
    .transform((val) => parseInt(val, 10)),
  CACHE_TTL_MINUTES: z
    .string()
    .default('30')
    .transform((val) => parseInt(val, 10)),
  LANGCHAIN_TRACING_V2: z.string().optional(),
  LANGCHAIN_API_KEY: z.string().optional(),
  LANGCHAIN_PROJECT: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = _env.success ? _env.data : envSchema.parse({});
