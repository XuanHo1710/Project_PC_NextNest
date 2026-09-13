import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePaymentDto, MICROSERVICE } from '@project-pc/common';

import { Payment, PaymentDocument } from 'src/payment/entity/payment.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import {
  PayOSClient,
  PayOSConstructorStatic,
} from 'src/payment/types/payos.types';

@Injectable()
export class PayosService {
  private readonly logger = new Logger(PayosService.name);
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

  private createPayOS(): PayOSClient {
    const mod = require('@payos/node') as { PayOS: PayOSConstructorStatic };
    return new mod.PayOS({
      clientId: this.clientID,
      apiKey: this.apiKey,
      checksumKey: this.checkSum,
    });
  }

  /**
   * Collision-resistant paymentCode (PayOS orderCode): <= 9 digits numeric.
   */
  private generatePaymentCode(): number {
    return parseInt(
      `${Date.now()}${Math.floor(100 + Math.random() * 900)}`.slice(-9),
      10,
    );
  }

  // ================================================================
  //  PayOS webhook signature (official v2 algorithm)
  //  signature = HMAC_SHA256(checksumKey, convertObjToQueryStr(sortObjDataByKey(data)))
  // ================================================================

  private sortObjDataByKey(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  }

  private convertObjToQueryStr(object: Record<string, unknown>): string {
    return Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .map((key) => {
        let value = object[key];
        if (value && Array.isArray(value)) {
          value = JSON.stringify(
            value.map((val) => this.sortObjDataByKey(val as Record<string, unknown>)),
          );
        }
        if ([null, undefined, 'undefined', 'null'].includes(value as never)) {
          value = '';
        }
        return `${key}=${value}`;
      })
      .join('&');
  }

  private computeWebhookSignature(data: Record<string, unknown>): string {
    return crypto
      .createHmac('sha256', this.checkSum)
      .update(this.convertObjToQueryStr(this.sortObjDataByKey(data)))
      .digest('hex');
  }

  /**
   * PayOS webhook handler.
   * - Verifies HMAC-SHA256 signature over the canonicalized webhook `data`.
   * - Idempotent: repeated/out-of-order webhooks never double-process.
   * - Amount mismatch is logged + flagged but NEVER marks the payment paid.
   */
  async handlePayosWebhook(payload: any): Promise<{ received: boolean }> {
    const code = payload?.code;
    const success = payload?.success;
    const signature = payload?.signature;
    const rawData = payload?.data;

    if (!rawData || !signature) {
      throw new BadRequestException('Dữ liệu webhook không hợp lệ');
    }

    if (!this.checkSum) {
      throw new BadRequestException('PAYOS_CHECKSUM chưa được cấu hình');
    }

    let dataObj: Record<string, unknown>;
    try {
      dataObj =
        typeof rawData === 'string'
          ? JSON.parse(rawData)
          : JSON.parse(JSON.stringify(rawData));
    } catch {
      throw new BadRequestException('Không thể parse dữ liệu webhook');
    }

    const expectedSignature = this.computeWebhookSignature(dataObj);
    const receivedSignature = String(signature);
    const a = Buffer.from(expectedSignature);
    const b = Buffer.from(receivedSignature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new BadRequestException('Chữ ký webhook không hợp lệ');
    }

    const orderCode = Number(dataObj.orderCode);
    const amount = Number(dataObj.amount);
    if (!Number.isInteger(orderCode) || orderCode <= 0) {
      throw new BadRequestException('orderCode không hợp lệ trong webhook');
    }

    const incomingStatus =
      code === '00' && success !== false ? 'PAID' : 'UNPAID';

    const payment = await this.paymentModel.findOne({ paymentCode: orderCode });
    if (!payment) {
      this.logger.warn(
        `PayOS webhook cho mã thanh toán không tồn tại: ${orderCode}`,
      );
      return { received: true };
    }

    // Idempotency: same status → skip processing silently
    if (payment.status === incomingStatus) {
      return { received: true };
    }

    // Never regress a PAID payment due to out-of-order webhooks
    if (payment.status === 'PAID' && incomingStatus === 'UNPAID') {
      return { received: true };
    }

    if (incomingStatus === 'PAID') {
      // Amount tampering check — do NOT mark paid on mismatch
      if (Number(payment.amount) !== amount) {
        this.logger.error(
          `SUSPICIOUS PayOS webhook: amount mismatch cho payment ${orderCode} — expected ${payment.amount}, received ${amount}. Không đánh dấu đã thanh toán.`,
        );
        await this.paymentModel.updateOne(
          { _id: payment._id },
          { $set: { note: `AMOUNT_MISMATCH:expected=${payment.amount};received=${amount}` } },
        );
        return { received: true };
      }

      payment.status = 'PAID';
      payment.transactionId =
        String(dataObj.reference ?? '') ||
        String(dataObj.paymentLinkId ?? '') ||
        payment.transactionId;
      await payment.save();

      const order = await this.fetchOrderById(payment.order.toString());
      await this.applyPaidEffects(payment, order);

      return { received: true };
    }

    // Failure webhooks only downgrade a still-PENDING payment
    if (payment.status === 'PENDING') {
      payment.status = 'UNPAID';
      await payment.save();
    }
    return { received: true };
  }

  private async fetchOrderById(orderId: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.orderService.send('order.getById', { orderId }),
      );
    } catch (err) {
      console.error('Failed to fetch order:', err);
      return null;
    }
  }

  /**
   * Shared post-payment effects: mark order COMPLETED (trusted internal call),
   * clear the guest cart and send the confirmation email.
   */
  private async applyPaidEffects(payment: PaymentDocument, order: any) {
    const orderId = payment.order.toString();

    try {
      await firstValueFrom(
        this.orderService.send('order.updateStatus', {
          id: orderId,
          updateOrderDto: {
            status: 'COMPLETED',
            payment: { isCheckout: true, type: 'CARD' },
          },
          isAdmin: true,
        }),
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
    }

    const guestId = order?.customerInfo?.guestId
      ? String(order.customerInfo.guestId)
      : '';
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

    const orderItems = (order?.orderDetail || []).map((item: any) => ({
      productVariant: item.variantId || '',
      productName: item.productName || '',
      combination: item.combination || {},
      quantity: item.quantity || 0,
      price: item.price || 0,
      subtotal: item.subtotal || 0,
    }));
    const customerEmail: string = order?.customerInfo?.email || '';

    this.sendOrderEmailNotification(
      customerEmail,
      orderId,
      payment.amount,
      orderItems,
      payment.transactionId,
    ).catch((err) => console.error('Email notification error:', err));
  }

  /**
   * COD: Create payment record when seller confirms money received
   */
  async createPaymentForCashOnDelivery(orderId: string, amount: number) {
    const existingCount = await this.paymentModel.countDocuments({
      order: new Types.ObjectId(orderId),
    });

    const paymentPayload = {
      paymentCode: this.generatePaymentCode(),
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
   * Refund payment via PayOS.
   * SDK v2 (@payos/node) does not expose any refund API (only
   * create/get/cancel on payment-requests), so refunding through
   * PayOS is not possible yet. No local state is changed.
   */
  async refundPayment(orderId: string) {
    throw new NotImplementedException(
      'Refund qua PayOS chưa được hỗ trợ bởi SDK',
    );
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
   * Expire all PENDING payments for multiple orders in one update.
   * Mirrors expirePaymentsByOrderId field logic exactly (order $in + PENDING → EXPIRED).
   */
  async expirePaymentsByOrderIds(orderIds: string[]) {
    const objectIds = (orderIds || [])
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      return { acknowledged: true, modifiedCount: 0 };
    }

    return await this.paymentModel.updateMany(
      {
        order: { $in: objectIds },
        status: 'PENDING',
      },
      { status: 'EXPIRED' },
    );
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

    const paymentCode = this.generatePaymentCode();
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
      const order = await this.fetchOrderById(payment.order.toString());

      if (paymentLinkInfo.status === 'PAID') {
        // Idempotency: already PAID → skip downstream effects silently
        if (payment.status === 'PAID') {
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
        }

        payment.status = 'PAID';
        payment.transactionId =
          paymentLinkInfo.transactions?.[0]?.reference || payment.transactionId;
        await payment.save();

        await this.applyPaidEffects(payment, order);

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
