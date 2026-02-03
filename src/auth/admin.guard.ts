import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req.user && req.user.role === 'admin') {
      return true;
    }
    throw new ForbiddenException('Admin role required');
  }
}
