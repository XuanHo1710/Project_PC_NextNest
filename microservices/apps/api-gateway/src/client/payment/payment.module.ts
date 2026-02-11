import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { PaymentController } from 'client/payment/payment.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.PAYMENT_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.PAYMENT_SERVICE,
        },
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [],
})
export class PaymentModule {}
