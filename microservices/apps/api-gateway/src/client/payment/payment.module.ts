import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { PaymentController } from 'client/payment/payment.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.PAYMENT_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin@localhost:5673'],
          queue: 'payment.main',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'payment.retry.exchange',
              'x-dead-letter-routing-key': 'payment.retry',
            },
          },
        },
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [],
})
export class PaymentModule {}
