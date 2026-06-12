import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CustomerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Appended by JwtAuthGuard

    if (!user || user.role !== 'customer') {
      throw new ForbiddenException('Access denied. Customer role required.');
    }

    return true;
  }
}
