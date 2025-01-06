import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  tenantId?: string;
  permissions?: string[];
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): IUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
