// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { CacheService } from '../cache/cache.service';
import { AuditLog } from './entities/audit-log.entity';
import { IAuthUser, IAuditLog } from './interfaces/auth.interfaces';

@Injectable()
export class AuthService {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async validateToken(token: string): Promise<any> {
    const cacheKey = `token:${token}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await lastValueFrom(
        this.httpService.post('/validate-token', {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      
      await this.cacheService.set(cacheKey, response.data, this.CACHE_TTL);
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserInfo(token: string): Promise<IAuthUser> {
    const cacheKey = `userinfo:${token}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get('/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      
      await this.cacheService.set(cacheKey, response.data, this.CACHE_TTL);
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Unable to fetch user information');
    }
  }

  async hasPermission(user: IAuthUser, requiredPermission: string): Promise<boolean> {
    const cacheKey = `permissions:${user.id}:${requiredPermission}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const hasPermission = user.permissions.includes(requiredPermission);
    await this.cacheService.set(cacheKey, hasPermission, this.CACHE_TTL);
    
    return hasPermission;
  }

  async hasRole(user: IAuthUser, requiredRole: string): Promise<boolean> {
    return user.roles.includes(requiredRole);
  }

  async hasAllPermissions(user: IAuthUser, requiredPermissions: string[]): Promise<boolean> {
    if (!user.permissions) {
      return false;
    }

    const results = await Promise.all(
      requiredPermissions.map(permission => this.hasPermission(user, permission))
    );
    return results.every(Boolean);
  }

  async hasAnyPermission(user: IAuthUser, requiredPermissions: string[]): Promise<boolean> {
    if (!user.permissions) {
      return false;
    }

    const results = await Promise.all(
      requiredPermissions.map(permission => this.hasPermission(user, permission))
    );
    return results.some(Boolean);
  }

  async logAudit(auditData: IAuditLog): Promise<void> {
    const log = this.auditLogRepository.create(auditData);
    await this.auditLogRepository.save(log);
  }

  async getAuditLogs(
    tenantId: string,
    filters: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page = 1,
    limit = 10
  ): Promise<{ data: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.tenantId = :tenantId', { tenantId });

    if (filters.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.resource) {
      queryBuilder.andWhere('audit.resource = :resource', { resource: filters.resource });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('audit.timestamp >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('audit.timestamp <= :endDate', { endDate: filters.endDate });
    }

    const [logs, total] = await queryBuilder
      .orderBy('audit.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: logs, total };
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheService.delPattern(`*:${userId}:*`);
  }
}