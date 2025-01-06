import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IAuthUser } from '../interfaces/auth.interfaces';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: IAuthUser = request.user;

    // Log access attempt
    await this.authService.logAudit({
      userId: user.id,
      action: 'access',
      resource: context.getClass().name,
      resourceId: context.getHandler().name,
      success: false,
      timestamp: new Date(),
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const hasRole = await Promise.all(
      requiredRoles.map(role => this.authService.hasRole(user, role))
    );

    const authorized = hasRole.some(Boolean);

    // Log result
    await this.authService.logAudit({
      userId: user.id,
      action: 'access',
      resource: context.getClass().name,
      resourceId: context.getHandler().name,
      success: authorized,
      reason: authorized ? undefined : 'Insufficient roles',
      timestamp: new Date(),
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return authorized;
  }
}