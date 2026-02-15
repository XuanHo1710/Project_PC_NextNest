import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MICROSERVICE_PORT } from '@project-pc/common';
import { Logger } from '@nestjs/common';
import { setupElasticsearchRabbitMQ } from 'src/rabbitmq.elasticsearch.setup';

async function bootstrap() {
  const logger = new Logger('ElasticsearchService');

  await setupElasticsearchRabbitMQ();

  const app = await NestFactory.create(AppModule);

  // RabbitMQ transport — for receiving events from product-service
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin@localhost:5673'],
      queue: 'elasticsearch.main',
      noAck: false,
      prefetchCount: 10,
      queueOptions: {
        durable: true,
      },
    },
  });

  // TCP transport — for request/reply (search queries from gateway)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: MICROSERVICE_PORT.ELASTICSEARCH_SERVICE,
    },
  });

  await app.startAllMicroservices();
  logger.log(
    `Elasticsearch microservice started on TCP:${MICROSERVICE_PORT.ELASTICSEARCH_SERVICE} + RMQ`,
  );
}
bootstrap();
