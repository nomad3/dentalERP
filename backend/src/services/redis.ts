import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      this.client.on('error', (error) => {
        logger.error('Redis client error:', error);
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
      });

      await this.client.connect();
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      if (!this.client) return false;
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  // Redis operations
  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis not initialized');
    return await this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    if (!this.client) throw new Error('Redis not initialized');
    await this.client.set(key, value);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (!this.client) throw new Error('Redis not initialized');
    await this.client.setEx(key, seconds, value);
  }

  async del(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis not initialized');
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis not initialized');
    return await this.client.exists(key);
  }
}
