import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuperadminModule } from './module/superadmin/superadmin.module';
import { AuthModule } from './module/auth/auth.module';
import { CustomersModule } from './module/customers/customers.module';
import { MenusModule } from './module/menus/menus.module';
import { CategoriesModule } from './module/categories/categories.module';
import { DealsModule } from './module/deals/deals.module';
import { ExpenseCategoriesModule } from './module/expense-categories/expense-categories.module';
import { ExpensesModule } from './module/expenses/expenses.module';
import { OrdersModule } from './module/orders/orders.module';

@Module({
  imports: [SuperadminModule, AuthModule, CustomersModule, MenusModule, CategoriesModule, DealsModule, ExpenseCategoriesModule, ExpensesModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
