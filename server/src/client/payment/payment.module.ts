import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { VnpayService } from './vnpay.service';

@Module({
    imports: [ConfigModule],
    controllers: [PaymentController],
    providers: [VnpayService],
    exports: [VnpayService]
})
export class PaymentModule { }