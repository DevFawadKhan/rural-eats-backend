import { Injectable } from '@nestjs/common';
import { db } from '../../db';
import { logsTable } from '../../db/schema/logs.schema';

@Injectable()
export class LogsService {
  async getAllLogs() {
    const logs = await db.query.logsTable.findMany({
      with: {
        user: true,
      },
      orderBy: (logs, { desc }) => [desc(logs.createdAt)],
      limit: 100, // Fetch top 100 logs for settings screen
    });

    return logs.map((log) => ({
      id: log.id,
      timestamp: log.createdAt,
      user: log.user ? log.user.email : 'System',
      event: log.action,
      level:
        log.action.toLowerCase().includes('error') ||
        log.action.toLowerCase().includes('fail')
          ? 'Error'
          : 'Info',
    }));
  }

  async createLog(action: string, details?: any, userId?: number) {
    try {
      await db.insert(logsTable).values({
        action,
        details: details || {},
        userId: userId || null,
      });
    } catch (error) {
      console.error('Failed to create system log:', error);
    }
  }
}
