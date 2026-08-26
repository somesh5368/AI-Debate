import { Annotation } from '@langchain/langgraph';

/**
 * Multi-Model Debate State Schema.
 * Holds:
 * - topic: user's question / decision / comparison
 * - factual: Gemini ground facts, metrics, specs, verifiable data
 * - pragmatic: OpenAI practical step-by-step action plan
 * - critical: Groq / Llama risk, downsides, hidden failure points
 * - strategic: Claude long-term tradeoffs, second-order effects, positioning
 * - verdict: Supreme Judge single synthesized WhatsApp response
 */
export const DebateState = Annotation.Root({
  topic: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  factual: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  pragmatic: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  critical: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  strategic: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  verdict: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
});