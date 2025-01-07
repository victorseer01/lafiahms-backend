// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { CustomRequest } from '../interfaces/custom-request.interface';

// export const CurrentTenant = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
//   const request = ctx.switchToHttp().getRequest<CustomRequest>();
//   return request.tenant;
// });


import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from '../interfaces/custom-request.interface';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();
    return request.tenant;
  },
);