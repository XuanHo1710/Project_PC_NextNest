import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from 'client/client.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from 'admin/admin.module';

@Module({
  imports: [ConfigModule.forRoot(), ClientModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
