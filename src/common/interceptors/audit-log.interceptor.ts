import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LogsService } from '../../module/logs/logs.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    
    // We only want to log mutations (POST, PUT, PATCH, DELETE), not every single GET request
    const method = req.method;
    if (method === 'GET') {
      return next.handle();
    }

    const url = req.url;
    const body = req.body;
    const user = req.user; // populated by auth guard if it exists

    // Determine the action name
    let actionType = 'Action';
    if (method === 'POST') actionType = 'Created';
    else if (method === 'PUT' || method === 'PATCH') actionType = 'Updated';
    else if (method === 'DELETE') actionType = 'Deleted';

    // Parse the module/resource from the URL (e.g., /api/customers -> customers)
    const resource = url.split('/')[2] || 'Resource';
    
    // Clean up resource string (capitalize)
    const action = `${actionType} ${resource.charAt(0).toUpperCase() + resource.slice(1)}`;

    // Prepare details
    const details = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      body: method !== 'DELETE' ? body : undefined, // Log body payload if it's not a delete
    };

    return next.handle().pipe(
      tap(() => {
        // Log success
        this.logsService.createLog(action, details, user?.sub || user?.id);
      }),
      catchError((error) => {
        // Log failure
        this.logsService.createLog(
          `${action} Failed`,
          { ...details, error: error.message },
          user?.sub || user?.id
        );
        throw error;
      }),
    );
  }
}
