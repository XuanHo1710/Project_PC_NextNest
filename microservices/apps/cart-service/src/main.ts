import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MICROSERVICE, getServicePort } from '@project-pc/common';
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: getServicePort(MICROSERVICE.CART_SERVICE),
      },
    },
  );
  await app.listen();
}
bootstrap();
