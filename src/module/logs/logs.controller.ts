import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CustomerGuard } from '../auth/guards/customer.guard';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Logs')
  async getLogs() {
    return await this.logsService.getAllLogs();
  }

  @Get('customer')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  async getCustomerLogs(@Request() req: any) {
    return await this.logsService.getCustomerLogs(req.user.id);
  }
}
