import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './module/admin/admin.module';
import { AuthModule } from './module/auth/auth.module';
import { CustomersModule } from './module/customers/customers.module';
import { MenusModule } from './module/menus/menus.module';
import { CategoriesModule } from './module/categories/categories.module';
import { DealsModule } from './module/deals/deals.module';
import { ExpenseCategoriesModule } from './module/expense-categories/expense-categories.module';
import { ExpensesModule } from './module/expenses/expenses.module';
import { OrdersModule } from './module/orders/orders.module';
import { SettingsModule } from './module/settings/settings.module';
import { RolesModule } from './module/roles/roles.module';
import { LogsModule } from './module/logs/logs.module';
import { DashboardModule } from './module/dashboard/dashboard.module';
import { ChatModule } from './module/chat/chat.module';
import { CarouselModule } from './module/carousel/carousel.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [AdminModule, AuthModule, CustomersModule, MenusModule, CategoriesModule, DealsModule, ExpenseCategoriesModule, ExpensesModule, OrdersModule, SettingsModule, RolesModule, LogsModule, DashboardModule, ChatModule, CarouselModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
