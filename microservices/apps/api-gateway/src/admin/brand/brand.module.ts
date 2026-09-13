import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, getRabbitMqUrl } from '@project-pc/common';
@Module({
  imports: [
    ClientsModule.register([
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
  controllers: [BrandController],
})
export class BrandModule {}