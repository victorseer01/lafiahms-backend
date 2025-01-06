// src/modules/cache/cache.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get(key: string): Promise<any> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } else {
      await this.redis.set(key, JSON.stringify(value));
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Patient cache methods
  async invalidatePatientCache(tenantId: string, patientId: string): Promise<void> {
    await this.delPattern(`patients:${tenantId}:*`);
  }

  // Person cache methods
  async invalidatePersonCache(tenantId: string, personId: string): Promise<void> {
    await this.delPattern(`persons:${tenantId}:*`);
  }

  // Encounter cache methods
  async invalidateEncounterCache(tenantId: string, encounterId: string): Promise<void> {
    await this.delPattern(`encounters:${tenantId}:*`);
  }

  // Concept cache methods
  async invalidateConceptCache(tenantId: string): Promise<void> {
    await this.delPattern(`concepts:${tenantId}:*`);
  }

  async getConceptCache(key: string): Promise<any> {
    return this.get(`concepts:${key}`);
  }

  async setConceptCache(key: string, value: any, ttl?: number): Promise<void> {
    await this.set(`concepts:${key}`, value, ttl);
  }

  // User cache methods
  async invalidateUserCache(userId: string): Promise<void> {
    await this.delPattern(`*:${userId}:*`);
  }

  // Generic cache methods for any entity
  async invalidateEntityCache(tenantId: string, entity: string): Promise<void> {
    await this.delPattern(`${entity}:${tenantId}:*`);
  }

  async getEntityCache(entity: string, key: string): Promise<any> {
    return this.get(`${entity}:${key}`);
  }

  async setEntityCache(entity: string, key: string, value: any, ttl?: number): Promise<void> {
    await this.set(`${entity}:${key}`, value, ttl);
  }

  async invalidateTemplateCache(tenantId: string, templateId?: string): Promise<void> {
    if (templateId) {
      await this.delPattern(`templates:${tenantId}:${templateId}*`);
    } else {
      await this.delPattern(`templates:${tenantId}:*`);
    }
  }

  async getTemplateCache(tenantId: string, templateId: string): Promise<any> {
    return this.get(`templates:${tenantId}:${templateId}`);
  }

  async setTemplateCache(tenantId: string, templateId: string, data: any, ttl?: number): Promise<void> {
    await this.set(`templates:${tenantId}:${templateId}`, data, ttl);
  }
}