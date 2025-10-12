import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ClientModule } from './client/client.module';
import { AdminModule } from './admin/admin.module';
import { AppService } from 'src/app.service';
import { ChatbotModule } from './chatbot/chatbot.module';
import { RedisModule } from './redis/redis.module';
const mongooseAutoPopulate = require('mongoose-autopopulate');


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection: Connection) => {
          connection.plugin(mongooseAutoPopulate);
          return connection;
        }
      }),
      inject: [ConfigService]
    }),
    RedisModule,
    AdminModule,
    ClientModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService]
})
export class AppModule { }
