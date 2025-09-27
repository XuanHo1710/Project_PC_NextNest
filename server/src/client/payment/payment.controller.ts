import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { Request } from 'express';

export class CreatePaymentDto {
    orderId: string;
    amount: number;
    orderDescription: string;
}

@Controller('payment')
export class PaymentController {
    constructor(private readonly vnpayService: VnpayService) { }

    @Post('create-vnpay-url')
    createVnpayPaymentUrl(@Body() createPaymentDto: CreatePaymentDto, @Req() req: Request) {
        const { orderId, amount, orderDescription } = createPaymentDto;

        return this.vnpayService.createPaymentUrl(orderId, amount, orderDescription);
    }

    @Get('vnpay-return')
    handleVnpayReturn(@Query() query: any) {
        return this.vnpayService.verifyReturnUrl(query);
    }
}