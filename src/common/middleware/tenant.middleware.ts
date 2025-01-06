import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../../modules/tenant/tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request & { tenant?: any }, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      throw new NotFoundException('Tenant ID not found in request headers');
    }

    try {
      const tenant = await this.tenantService.findById(tenantId);
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
      }

      req.tenant = tenant;
      next();
    } catch (error) {
      next(error);
    }
  }
}