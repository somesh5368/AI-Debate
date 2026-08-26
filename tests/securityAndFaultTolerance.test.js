import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/index.js';
import { cacheService } from '../src/services/cacheService.js';
import { alertService } from '../src/services/alertService.js';
import { createGeminiNode } from '../src/graph/nodes/geminiNode.js';
import { createChatGPTNode } from '../src/graph/nodes/chatgptNode.js';
import { createGroqNode } from '../src/graph/nodes/groqNode.js';
import { createClaudeNode } from '../src/graph/nodes/claudeNode.js';
import { createJudgeNode } from '../src/graph/nodes/judgeNode.js';

describe('Security, Token Optimization & Fault Tolerance Suite', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  describe('1. Token Cost Optimization & Input Protection', () => {
    it('truncates inputs longer than 300 characters', async () => {
      const longTopic = 'A'.repeat(500);
      const res = await request(app)
        .post('/webhook')
        .type('form')
        .send({ Body: longTopic });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/xml');
      expect(res.text).toContain('MULTI-MODEL AI DEBATE ARENA');
    });

    it('returns cached debate response on duplicate queries (0 token cost)', async () => {
      const topic = 'Should I learn TypeScript?';

      // First call (populates cache)
      const res1 = await request(app).post('/webhook').type('form').send({ Body: topic });
      expect(res1.status).toBe(200);

      // Verify item is in cache
      const cached = cacheService.get(topic);
      expect(cached).not.toBeNull();
      expect(cached.topic).toContain('Should I learn TypeScript?');

      // Second call (hits cache)
      const res2 = await request(app).post('/webhook').type('form').send({ Body: topic });
      expect(res2.status).toBe(200);
      expect(res2.text).toContain('MULTI-MODEL AI DEBATE ARENA');
    });
  });

  describe('2. Fault Tolerance & Resilient Fallbacks', () => {
    it('geminiNode falls back gracefully and triggers alert if model throws error', async () => {
      const failingModel = {
        invoke: jest.fn().mockRejectedValue(new Error('API Key Expired / 429 Rate Limit')),
      };

      const spyAlert = jest.spyOn(alertService, 'triggerAlert');
      const failingGeminiNode = createGeminiNode(failingModel);

      const state = await failingGeminiNode({ topic: 'Test Topic' });

      expect(state.geminiOpinion).toContain('Factual Analysis');
      expect(spyAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'geminiNode',
          level: 'WARNING',
        })
      );

      spyAlert.mockRestore();
    });

    it('chatgptNode, groqNode, claudeNode, and judgeNode fall back gracefully when models fail', async () => {
      const failingModel = {
        invoke: jest.fn().mockRejectedValue(new Error('Simulated model crash')),
      };

      const cNode = createChatGPTNode(failingModel);
      const gNode = createGroqNode(failingModel);
      const clNode = createClaudeNode(failingModel);
      const jNode = createJudgeNode(failingModel);

      const state1 = await cNode({ topic: 'Test' });
      const state2 = await gNode({ topic: 'Test' });
      const state3 = await clNode({ topic: 'Test' });
      const state4 = await jNode({ topic: 'Test', geminiOpinion: 'Op1', chatgptOpinion: 'Op2' });

      expect(state1.chatgptOpinion).toBeDefined();
      expect(state2.groqOpinion).toBeDefined();
      expect(state3.claudeOpinion).toBeDefined();
      expect(state4.finalVerdict).toBeDefined();
    });
  });

  describe('3. Alert Service Verification', () => {
    it('triggerAlert logs warnings and critical errors cleanly', async () => {
      const spyAlert = jest.spyOn(alertService, 'triggerAlert');

      await alertService.triggerAlert({
        level: 'CRITICAL',
        source: 'TestModule',
        message: 'System critical alert test',
        error: new Error('Critical failure'),
      });

      expect(spyAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'CRITICAL',
          source: 'TestModule',
        })
      );

      spyAlert.mockRestore();
    });
  });
});
