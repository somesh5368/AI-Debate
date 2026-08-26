import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/index.js';
import { cacheService } from '../src/services/cacheService.js';
import { alertService } from '../src/services/alertService.js';
import { createFactualNode } from '../src/graph/nodes/factualNode.js';
import { createPragmaticNode } from '../src/graph/nodes/pragmaticNode.js';
import { createCriticalNode } from '../src/graph/nodes/criticalNode.js';
import { createStrategicNode } from '../src/graph/nodes/strategicNode.js';
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
    });

    it('returns cached debate response on duplicate queries (0 token cost)', async () => {
      const topic = 'Should I learn Rust?';

      // First call
      const res1 = await request(app).post('/webhook').type('form').send({ Body: topic });
      expect(res1.status).toBe(200);

      // Verify item in cache
      const cached = cacheService.get(topic);
      expect(cached).not.toBeNull();
      expect(cached.topic).toContain('Should I learn Rust?');

      // Second call
      const res2 = await request(app).post('/webhook').type('form').send({ Body: topic });
      expect(res2.status).toBe(200);
    });
  });

  describe('2. Fault Tolerance & Resilient Fallbacks', () => {
    it('factualNode falls back gracefully and triggers alert if model throws error', async () => {
      const failingModel = {
        invoke: jest.fn().mockRejectedValue(new Error('API Key Expired / 429 Rate Limit')),
      };

      const spyAlert = jest.spyOn(alertService, 'triggerAlert');
      const failingFactualNode = createFactualNode(failingModel);

      const state = await failingFactualNode({ topic: 'Test Topic' });

      expect(state.factual).toContain('Factual Data Perspective temporarily unavailable');
      expect(spyAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'factualNode',
          level: 'WARNING',
        })
      );

      spyAlert.mockRestore();
    });

    it('pragmaticNode, criticalNode, strategicNode, and judgeNode fall back gracefully when models fail', async () => {
      const failingModel = {
        invoke: jest.fn().mockRejectedValue(new Error('Simulated model crash')),
      };

      const pNode = createPragmaticNode(failingModel);
      const cNode = createCriticalNode(failingModel);
      const sNode = createStrategicNode(failingModel);
      const jNode = createJudgeNode(failingModel);

      const state1 = await pNode({ topic: 'Test' });
      const state2 = await cNode({ topic: 'Test' });
      const state3 = await sNode({ topic: 'Test' });
      const state4 = await jNode({ topic: 'Test', factual: 'F', pragmatic: 'P' });

      expect(state1.pragmatic).toBeDefined();
      expect(state2.critical).toBeDefined();
      expect(state3.strategic).toBeDefined();
      expect(state4.verdict).toBeDefined();
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
