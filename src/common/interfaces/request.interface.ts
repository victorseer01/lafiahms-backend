import { Request } from 'express';
import { Tenant } from '../../modules/tenant/entities/tenant.entity';

export interface CustomRequest extends Request {
  tenant?: Tenant;
  user?: any;
}