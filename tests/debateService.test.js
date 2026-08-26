import { describe, test, expect } from '@jest/globals';
import { createDebateGraph } from '../src/graph/debateGraph.js';
import { formatDebateResponse, createTwimlResponse } from '../src/services/formatter.js';

describe('LangGraph 4-LLM Multi-Model Debate Graph', () => {
  test('should orchestrate 4 parallel model nodes (Gemini, ChatGPT, Groq, Claude) and synthesize final verdict', async () => {
    const mockGeminiNode = async () => ({ geminiOpinion: 'Gemini: Factual data points' });
    const mockChatGPTNode = async () => ({ chatgptOpinion: 'ChatGPT: Pragmatic steps' });
    const mockGroqNode = async () => ({ groqOpinion: 'Groq: Critical risks' });
    const mockClaudeNode = async () => ({ claudeOpinion: 'Claude: Strategic synthesis' });
    const mockJudgeNode = async (state) => ({
      finalVerdict: `Supreme Judge evaluated all models. Winning model: Gemini. Recommendation: Proceed.`,
    });

    const customGraph = createDebateGraph({
      geminiNode: mockGeminiNode,
      chatgptNode: mockChatGPTNode,
      groqNode: mockGroqNode,
      claudeNode: mockClaudeNode,
      judgeNode: mockJudgeNode,
    });

    const result = await customGraph.invoke({
      topic: 'Should I learn Java or Python first?',
    });

    expect(result.topic).toBe('Should I learn Java or Python first?');
    expect(result.geminiOpinion).toContain('Gemini: Factual data points');
    expect(result.chatgptOpinion).toContain('ChatGPT: Pragmatic steps');
    expect(result.groqOpinion).toContain('Groq: Critical risks');
    expect(result.claudeOpinion).toContain('Claude: Strategic synthesis');
    expect(result.finalVerdict).toContain('Supreme Judge evaluated all models');
  });
});

describe('Formatter Service', () => {
  test('should correctly format 4-model debate state into premium WhatsApp template', () => {
    const sampleState = {
      topic: 'Java vs Python',
      geminiOpinion: '• Gemini fact 1\n• Gemini fact 2',
      chatgptOpinion: '• ChatGPT framework',
      groqOpinion: '• Groq risk factor',
      claudeOpinion: '• Claude strategic view',
      finalVerdict: 'Python is best for rapid entry, Java for enterprise scale.',
    };

    const formatted = formatDebateResponse(sampleState);

    expect(formatted).toContain('⚡ *MULTI-MODEL AI DEBATE ARENA* ⚡');
    expect(formatted).toContain('🤖 *1. GOOGLE GEMINI (Factual & Precise):*');
    expect(formatted).toContain('💡 *2. CHATGPT (Pragmatic & Structured):*');
    expect(formatted).toContain('🔥 *3. GROQ / LLAMA (Critical & Risk):*');
    expect(formatted).toContain('🧠 *4. ANTHROPIC CLAUDE (Strategic & Nuanced):*');
    expect(formatted).toContain('🏛️ *SUPREME VERDICT & FINAL RECOMMENDATION:*');
  });

  test('should wrap message in TwiML XML format', () => {
    const twiml = createTwimlResponse('Hello WhatsApp!');
    expect(twiml).toContain('<Response>');
    expect(twiml).toContain('<Message>Hello WhatsApp!</Message>');
    expect(twiml).toContain('</Response>');
  });
});
