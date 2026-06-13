import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('[RolesGuard] Required roles:', requiredRoles);
    console.log('[RolesGuard] User roles:', user?.roles || []);
    console.log('[RolesGuard] User email:', user?.email);

    const hasAccess = requiredRoles.some((role) => user.roles.includes(role));
    console.log('[RolesGuard] Access granted:', hasAccess);

    return hasAccess;
  }
}
