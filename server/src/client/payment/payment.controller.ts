import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { Request } from 'express';
import { ClientJwtAuthGuard } from '../auth/client-jwt-auth.guard';
import { Guest, Public } from 'decorators/customize';

export class CreatePaymentDto {
    orderId: string;
    amount: number;
    orderDescription: string;
}

@Controller('payment')
@UseGuards(ClientJwtAuthGuard)
export class PaymentController {
    constructor(private readonly vnpayService: VnpayService) { }

    @Post('create-vnpay-url')
    createVnpayPaymentUrl(
        @Body() createPaymentDto: CreatePaymentDto,
        @Guest() guest: any,
        @Req() req: Request
    ) {
        const { orderId, amount, orderDescription } = createPaymentDto;

        // Now we have access to authenticated guest info
        console.log('Guest making payment:', guest);

        return this.vnpayService.createPaymentUrl(orderId, amount, orderDescription);
    }

    @Get('vnpay-return')
    @Public() // This endpoint should be public as VNPay will call it
    handleVnpayReturn(@Query() query: any) {
        return this.vnpayService.verifyReturnUrl(query);
    }
}