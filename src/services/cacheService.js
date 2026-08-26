import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

class ResponseCache {
  constructor() {
    this.cache = new Map();
  }

  _hashTopic(topic) {
    if (!topic) return '';
    return topic.trim().toLowerCase();
  }

  get(topic) {
    const key = this._hashTopic(topic);
    const item = this.cache.get(key);
    if (!item) return null;

    const ttlMs = (env.CACHE_TTL_MINUTES || 30) * 60 * 1000;
    if (Date.now() - item.timestamp > ttlMs) {
      this.cache.delete(key);
      return null;
    }

    logger.info({ topic }, '⚡ [TOKEN OPTIMIZATION] Returning cached debate state (0 token cost)');
    return item.data;
  }

  set(topic, data) {
    const key = this._hashTopic(topic);
    if (!key || !data) return;

    // Keep cache size bounded (max 100 items)
    if (this.cache.size >= 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const cacheService = new ResponseCache();
