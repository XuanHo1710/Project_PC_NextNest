import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { Request } from 'express';
import { ClientJwtAuthGuard } from '../auth/client-jwt-auth.guard';
import { Guest, Public } from 'decorators/customize';
import { CreateOrderDto } from 'src/client/order/dto/create-order.dto';

export class CreatePaymentDto extends CreateOrderDto {
    orderId: string;
    orderDescription: string;
}

@Controller('payment')
@UseGuards(ClientJwtAuthGuard)
export class PaymentController {
    constructor(private readonly vnpayService: VnpayService) { }

    @Post('create-vnpay-url')
    createVnpayPaymentUrl(
        @Body() createPaymentDto: CreatePaymentDto
    ) {
        return this.vnpayService.createPaymentUrl(createPaymentDto);
    }

    @Get('vnpay-return')
    @Public() // This endpoint should be public as VNPay will call it
    handleVnpayReturn(@Query() query: any) {
        return this.vnpayService.verifyReturnUrl(query);
    }
}