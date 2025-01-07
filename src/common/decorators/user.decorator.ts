// import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
//   const request = ctx.switchToHttp().getRequest();
//   return request.user;
// });

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from '../interfaces/custom-request.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();
    return request.user;
  },
);