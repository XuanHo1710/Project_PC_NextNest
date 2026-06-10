import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MICROSERVICE_PORT } from '@project-pc/common';
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: MICROSERVICE_PORT.SAGA_ORCHESTRATOR_SERVICE,
      },
    },
  );
  await app.listen();
}
bootstrap();
