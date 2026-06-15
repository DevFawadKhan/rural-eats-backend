import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('Logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs() {
    return await this.logsService.getAllLogs();
  }
}
