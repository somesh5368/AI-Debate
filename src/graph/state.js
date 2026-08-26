import { Annotation } from '@langchain/langgraph';

/**
 * Multi-Model Debate State Schema.
 * Holds:
 * - topic: user's question / decision
 * - geminiOpinion: Gemini factual & precise perspective
 * - chatgptOpinion: ChatGPT pragmatic & structured perspective
 * - groqOpinion: Groq / Llama critical & risk perspective
 * - claudeOpinion: Claude strategic & nuanced perspective
 * - finalVerdict: Supreme Judge synthesis and recommendation
 */
export const DebateState = Annotation.Root({
  topic: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  geminiOpinion: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  chatgptOpinion: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  groqOpinion: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  claudeOpinion: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
  finalVerdict: Annotation({
    value: (left, right) => (right !== undefined ? right : left),
    default: () => '',
  }),
});