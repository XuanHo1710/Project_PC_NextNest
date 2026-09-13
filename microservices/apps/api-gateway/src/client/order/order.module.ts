import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  MICROSERVICE,
  getServiceHost,
  getServicePort,
  getRabbitMqUrl,
} from '@project-pc/common';
import { OrderController } from 'client/order/order.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.ORDER_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [getRabbitMqUrl()],
          queue: 'order.main',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'order.retry.exchange',
              'x-dead-letter-routing-key': 'order.retry',
            },
          },
        },
      },
      {
        name: MICROSERVICE.SAGA_ORCHESTRATOR_SERVICE,
        transport: Transport.TCP,
        options: {
          host: getServiceHost(MICROSERVICE.SAGA_ORCHESTRATOR_SERVICE),
          port: getServicePort(MICROSERVICE.SAGA_ORCHESTRATOR_SERVICE),
        },
      },
      {
        name: MICROSERVICE.PRODUCT_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [getRabbitMqUrl()],
          queue: 'product.main',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'product.retry.exchange',
              'x-dead-letter-routing-key': 'product.retry',
            },
          },
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [],
})
export class OrderModule {}