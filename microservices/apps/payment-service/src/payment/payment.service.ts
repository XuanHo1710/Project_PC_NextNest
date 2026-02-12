import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePaymentDto, MICROSERVICE } from '@project-pc/common';
import { PayOS } from '@payos/node';

import { Payment } from 'src/payment/entity/payment.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VnpayService {
  private clientID: string;
  private apiKey: string;
  private checkSum: string;
  private returnUrl: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @Inject(MICROSERVICE.NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {
    this.clientID = this.configService.get<string>('PAYOS_CLIENTID') || '';
    this.apiKey = this.configService.get<string>('PAYOS_APIKEY') || '';
    this.checkSum = this.configService.get<string>('PAYOS_CHECKSUM') || '';
    this.returnUrl = this.configService.get<string>('RETURN_URL') || '';
  }

  private createPayOS() {
    return new PayOS({
      clientId: this.clientID,
      apiKey: this.apiKey,
      checksumKey: this.checkSum,
    });
  }

  // Thanh toán khi nhận hàng (COD)
  async createPaymentForCashOnDelivery(orderId: string, amount: number) {
    const paymentPayload = {
      paymentCode: Date.now(),
      order: new Types.ObjectId(orderId),
      amount: amount,
      status: 'PENDING',
      transactionId: '',
    };
    const payment = await this.paymentModel.create(paymentPayload);
    return payment;
  }

  async updatePaymentStatus(
    orderId: string,
    status: 'PENDING' | 'PAID' | 'UNPAID',
  ) {
    return await this.paymentModel.findOneAndUpdate(
      {
        order: new Types.ObjectId(orderId),
      },
      { status: status },
      { new: true },
    );
  }

  async createPaymentUrl(createPaymentDto: CreatePaymentDto, ip: string) {
    const payos = this.createPayOS();

    const paymentCode: number = Date.now();
    const paymentLink = await payos.paymentRequests.create(
      {
        orderCode: paymentCode,
        amount: createPaymentDto.amount,
        expiredAt: Math.floor(Date.now() / 1000) + 15 * 60,
        description: 'Don hang ' + paymentCode,
        returnUrl: this.returnUrl,
        cancelUrl: this.returnUrl,
      },
      {
        maxRetries: 5,
        timeout: 10000,
      },
    );

    // Save payment record with PENDING status
    await this.paymentModel.create({
      paymentCode: paymentCode,
      order: new Types.ObjectId(createPaymentDto.order),
      amount: createPaymentDto.amount,
      status: 'PENDING',
      transactionId: paymentLink.paymentLinkId || '',
    });

    return {
      url: paymentLink.checkoutUrl,
      orderCode: paymentCode,
    };
  }

  // Verify payment from PayOS return URL
  async verifyPayment(
    orderCode: number,
    status: string,
    customerEmail: string,
    orderItems: Array<{
      productVariant: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>,
  ) {
    try {
      const payos = this.createPayOS();

      // Get payment link info from PayOS to verify the actual status
      const paymentLinkInfo = await payos.paymentRequests.get(orderCode);

      const payment = await this.paymentModel.findOne({
        paymentCode: orderCode,
      });

      if (!payment) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin thanh toán',
        };
      }

      if (paymentLinkInfo.status === 'PAID') {
        // Update payment status to PAID
        payment.status = 'PAID';
        payment.transactionId =
          paymentLinkInfo.transactions?.[0]?.reference || payment.transactionId;
        await payment.save();

        // Update stock for each product variant
        await this.updateProductStock(orderItems);

        // Send email notification (fire and forget, don't block the response)
        this.sendOrderEmailNotification(
          customerEmail,
          payment.order.toString(),
          payment.amount,
          orderItems,
        ).catch((err) => console.error('Email notification error:', err));

        return {
          success: true,
          message: 'Thanh toán thành công',
          data: {
            paymentCode: payment.paymentCode,
            amount: payment.amount,
            status: payment.status,
            transactionId: payment.transactionId,
            paidAt:
              paymentLinkInfo.transactions?.[0]?.transactionDateTime || null,
          },
        };
      } else if (
        paymentLinkInfo.status === 'CANCELLED' ||
        paymentLinkInfo.status === 'EXPIRED'
      ) {
        payment.status = 'UNPAID';
        await payment.save();

        return {
          success: false,
          message:
            paymentLinkInfo.status === 'CANCELLED'
              ? 'Thanh toán đã bị hủy'
              : 'Thanh toán đã hết hạn',
          data: {
            paymentCode: payment.paymentCode,
            amount: payment.amount,
            status: payment.status,
          },
        };
      } else {
        // PENDING or PROCESSING
        return {
          success: false,
          message: 'Thanh toán đang được xử lý',
          data: {
            paymentCode: payment.paymentCode,
            amount: payment.amount,
            status: paymentLinkInfo.status,
          },
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: 'Lỗi xác thực thanh toán',
      };
    }
  }

  // Update stock for product variants after successful payment
  private async updateProductStock(
    orderItems: Array<{
      productVariant: string;
      quantity: number;
    }>,
  ) {
    try {
      for (const item of orderItems) {
        await firstValueFrom(
          this.productService.send('product.variant.decrementStock', {
            variantId: item.productVariant,
            quantity: item.quantity,
          }),
        );
      }
    } catch (error) {
      console.error('Stock update error:', error);
    }
  }

  // Send order confirmation email
  private async sendOrderEmailNotification(
    email: string,
    orderId: string,
    amount: number,
    orderItems: Array<{
      productVariant: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>,
  ) {
    try {
      await firstValueFrom(
        this.notificationService.send('notification.sendOrderConfirmation', {
          email,
          orderId,
          amount,
          orderItems,
          paymentMethod: 'CARD',
        }),
      );
    } catch (error) {
      console.error('Send email error:', error);
    }
  }
}
