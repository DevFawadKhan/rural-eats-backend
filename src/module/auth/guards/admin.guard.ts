import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the role is 'Admin'
    // This allows roles that are functionally admins, while rejecting customers or other staff
    if (!user || user.role !== 'Admin') {
      throw new ForbiddenException('Access denied. Admin role required.');
    }

    return true;
  }
}
