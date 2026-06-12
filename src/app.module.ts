import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuperadminModule } from './module/superadmin/superadmin.module';
import { AuthModule } from './module/auth/auth.module';
import { CustomersModule } from './module/customers/customers.module';
import { MenusModule } from './module/menus/menus.module';

@Module({
  imports: [SuperadminModule, AuthModule, CustomersModule, MenusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
