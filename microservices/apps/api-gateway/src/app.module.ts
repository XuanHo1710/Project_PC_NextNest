import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ClientModule } from 'client/client.module';
import { MICROSERVICE } from 'constrain';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),

    ClientsModule.register([
      {
        name: MICROSERVICE.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 3002,
        },
      },
    ]),
    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
