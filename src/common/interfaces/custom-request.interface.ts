import { Request } from 'express';
import { IUser } from '../decorators/current-user.decorator';
import { Tenant } from '../../modules/tenant/entities/tenant.entity';

export interface CustomRequest extends Request {
  user?: IUser;
  tenant?: Tenant;
}
