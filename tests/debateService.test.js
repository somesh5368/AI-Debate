import { describe, test, expect } from '@jest/globals';
import { createDebateGraph } from '../src/graph/debateGraph.js';
import { formatDebateResponse, formatDebugDebateResponse, createTwimlResponse } from '../src/services/formatter.js';

describe('LangGraph 4-LLM Multi-Model Debate Graph', () => {
  test('should orchestrate 4 parallel model nodes (Factual, Pragmatic, Critical, Strategic) and synthesize final verdict', async () => {
    const mockFactualNode = async () => ({ factual: 'Gemini: Tata NCAP 5-star rating' });
    const mockPragmaticNode = async () => ({ pragmatic: 'OpenAI: Test drive both cars on highway' });
    const mockCriticalNode = async () => ({ critical: 'Groq: Mahindra has long waiting periods' });
    const mockStrategicNode = async () => ({ strategic: 'Claude: Tata leads EV market share' });
    const mockJudgeNode = async () => ({
      verdict: `*ANALYSIS & DECISION:*\nTata excels in EV ecosystem while Mahindra leads in diesel off-road.\n\n*VERDICT & RECOMMENDATION:*\nBuy Tata Nexon for daily city commute.`,
    });

    const customGraph = createDebateGraph({
      factualNode: mockFactualNode,
      pragmaticNode: mockPragmaticNode,
      criticalNode: mockCriticalNode,
      strategicNode: mockStrategicNode,
      judgeNode: mockJudgeNode,
    });

    const result = await customGraph.invoke({
      topic: 'Tata vs Mahindra car comparison',
    });

    expect(result.topic).toBe('Tata vs Mahindra car comparison');
    expect(result.factual).toContain('Gemini: Tata NCAP 5-star rating');
    expect(result.pragmatic).toContain('OpenAI: Test drive both cars');
    expect(result.critical).toContain('Groq: Mahindra has long waiting periods');
    expect(result.strategic).toContain('Claude: Tata leads EV market share');
    expect(result.verdict).toContain('*ANALYSIS & DECISION:*');
  });
});

describe('Formatter Service', () => {
  test('should format state for WhatsApp returning only the judge verdict', () => {
    const sampleState = {
      topic: 'Tata vs Mahindra',
      factual: 'Facts',
      pragmatic: 'Steps',
      critical: 'Risks',
      strategic: 'Strategy',
      verdict: '*ANALYSIS & DECISION:*\nTata leads safety.\n\n*VERDICT & RECOMMENDATION:*\nChoose Tata.',
    };

    const formatted = formatDebateResponse(sampleState);

    expect(formatted).toBe('*ANALYSIS & DECISION:*\nTata leads safety.\n\n*VERDICT & RECOMMENDATION:*\nChoose Tata.');
  });

  test('should format debug trace showing raw outputs + verdict', () => {
    const sampleState = {
      topic: 'Tata vs Mahindra',
      factual: 'Gemini Facts',
      pragmatic: 'OpenAI Steps',
      critical: 'Groq Risks',
      strategic: 'Claude Strategy',
      verdict: 'Final Verdict',
    };

    const debugText = formatDebugDebateResponse(sampleState);

    expect(debugText).toContain('🤖 1. GEMINI (Factual Facts & Specs):');
    expect(debugText).toContain('💡 2. OPENAI (Pragmatic Execution):');
    expect(debugText).toContain('🔥 3. GROQ (Critical Risk & Downsides):');
    expect(debugText).toContain('🧠 4. CLAUDE (Strategic Tradeoffs & Positioning):');
    expect(debugText).toContain('🏛️ FINAL WHATSAPP VERDICT (SENT TO USER):');
  });

  test('should wrap message in TwiML XML format', () => {
    const twiml = createTwimlResponse('Hello WhatsApp!');
    expect(twiml).toContain('<Response>');
    expect(twiml).toContain('<Message>Hello WhatsApp!</Message>');
    expect(twiml).toContain('</Response>');
  });
});
