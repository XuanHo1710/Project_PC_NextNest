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
    @Inject(MICROSERVICE.ORDER_SERVICE)
    private readonly orderService: ClientProxy,
    @Inject(MICROSERVICE.CART_SERVICE)
    private readonly cartService: ClientProxy,
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

  /**
   * COD: Create payment record when seller confirms money received
   */
  async createPaymentForCashOnDelivery(orderId: string, amount: number) {
    // Count existing payment records for this order
    const existingCount = await this.paymentModel.countDocuments({
      order: new Types.ObjectId(orderId),
    });

    const paymentPayload = {
      paymentCode: Date.now(),
      order: new Types.ObjectId(orderId),
      amount: amount,
      status: 'PAID',
      transactionId: '',
      paymentAttempt: existingCount + 1,
    };
    const payment = await this.paymentModel.create(paymentPayload);
    return payment;
  }

  /**
   * Refund payment: update the latest PAID payment for an order to REFUND status
   */
  async refundPayment(orderId: string) {
    const payment = await this.paymentModel.findOneAndUpdate(
      {
        order: new Types.ObjectId(orderId),
        status: 'PAID',
      },
      { status: 'REFUND' },
      { new: true, sort: { createdAt: -1 } },
    );
    return payment;
  }

  async updatePaymentStatus(
    orderId: string,
    status: 'PENDING' | 'PAID' | 'UNPAID' | 'EXPIRED' | 'REFUND',
  ) {
    return await this.paymentModel.findOneAndUpdate(
      {
        order: new Types.ObjectId(orderId),
        status: 'PENDING',
      },
      { status: status },
      { new: true, sort: { createdAt: -1 } },
    );
  }

  /**
   * Expire all PENDING payments for a given order
   */
  async expirePaymentsByOrderId(orderId: string) {
    const result = await this.paymentModel.updateMany(
      {
        order: new Types.ObjectId(orderId),
        status: 'PENDING',
      },
      { status: 'EXPIRED' },
    );
    return result;
  }

  /**
   * Create payment link (online payment)
   * Each call creates a NEW payment record (new attempt)
   */
  async createPaymentUrl(createPaymentDto: CreatePaymentDto, ip: string) {
    const payos = this.createPayOS();

    // Count existing payment records for this order to determine attempt number
    const existingCount = await this.paymentModel.countDocuments({
      order: new Types.ObjectId(createPaymentDto.order),
    });

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
      paymentAttempt: existingCount + 1,
    });

    return {
      url: paymentLink.checkoutUrl,
      orderCode: paymentCode,
    };
  }

  /**
   * Get all payments for an order
   */
  async getPaymentsByOrderId(orderId: string) {
    return await this.paymentModel
      .find({ order: new Types.ObjectId(orderId) })
      .sort({ createdAt: -1 });
  }

  /**
   * Verify payment from PayOS return URL
   * On success: update payment + order status, decrement stock, send email
   * Fetches order details from order-service instead of relying on client data
   */
  async verifyPayment(
    orderCode: number,
    status: string,
    guestId: string | null,
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

      // Fetch order details from order-service
      let order: any = null;
      try {
        order = await firstValueFrom(
          this.orderService.send('order.getById', {
            orderId: payment.order.toString(),
          }),
        );
      } catch (err) {
        console.error('Failed to fetch order:', err);
      }

      // Build orderItems and customerEmail from the order record
      const orderItems: Array<{
        productVariant: string;
        productName?: string;
        combination?: Record<string, string>;
        quantity: number;
        price: number;
        subtotal: number;
      }> = (order?.orderDetail || []).map((item: any) => ({
        productVariant: item.variantId || '',
        productName: item.productName || '',
        combination: item.combination || {},
        quantity: item.quantity || 0,
        price: item.price || 0,
        subtotal: item.subtotal || 0,
      }));
      const customerEmail: string = order?.customerInfo?.email || '';

      if (paymentLinkInfo.status === 'PAID') {
        // Update payment status to PAID
        payment.status = 'PAID';
        payment.transactionId =
          paymentLinkInfo.transactions?.[0]?.reference || payment.transactionId;
        await payment.save();

        // Update stock for each product variant
        await this.updateProductStock(orderItems);

        // Update order status to COMPLETED (paid successfully)
        try {
          await firstValueFrom(
            this.orderService.send('order.updateStatus', {
              id: payment.order.toString(),
              updateOrderDto: {
                status: 'COMPLETED',
                payment: { isCheckout: true, type: 'CARD' },
              },
            }),
          );
        } catch (err) {
          console.error('Failed to update order status:', err);
        }

        // Clear the guest's cart after successful payment
        if (guestId) {
          this.cartService
            .send('cart.update', {
              id: guestId,
              updateCartDto: { guestId, cartItems: [], total: 0 },
            })
            .subscribe({
              error: (err) => console.error('Cart clear error:', err),
            });
        }

        // Send email notification (fire and forget, don't block the response)
        this.sendOrderEmailNotification(
          customerEmail,
          payment.order.toString(),
          payment.amount,
          orderItems,
          payment.transactionId,
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
            orderId: payment.order.toString(),
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
            orderId: payment.order.toString(),
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
            orderId: payment.order.toString(),
          },
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);

      // Update payment status to UNPAID on verification failure
      // so it doesn't stay PENDING forever
      try {
        const failedPayment = await this.paymentModel.findOne({
          paymentCode: orderCode,
          status: 'PENDING',
        });
        if (failedPayment) {
          failedPayment.status = 'UNPAID';
          await failedPayment.save();
          console.log(
            `Payment ${orderCode} marked as UNPAID due to verification error`,
          );
        }
      } catch (updateErr) {
        console.error('Failed to update payment status on error:', updateErr);
      }

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
      productName?: string;
      combination?: Record<string, string>;
      quantity: number;
      price: number;
      subtotal: number;
    }>,
    transactionId?: string,
  ) {
    try {
      await firstValueFrom(
        this.notificationService.send('notification.sendOrderConfirmation', {
          email,
          orderId,
          amount,
          orderItems,
          paymentMethod: 'CARD',
          transactionId,
        }),
      );
    } catch (error) {
      console.error('Send email error:', error);
    }
  }
}
