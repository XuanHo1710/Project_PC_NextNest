import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePaymentDto, MICROSERVICE } from '@project-pc/common';
import { PayOS } from '@payos/node';

import moment from 'moment';
import { Payment } from 'src/payment/entity/payment.entity';
import { ClientProxy } from '@nestjs/microservices';
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
  ) {
    this.clientID = this.configService.get<string>('PAYOS_CLIENTID') || '';
    this.apiKey = this.configService.get<string>('PAYOS_APIKEY') || '';
    this.checkSum = this.configService.get<string>('PAYOS_CHECKSUM') || '';
    this.returnUrl = this.configService.get<string>('RETURN_URL') || '';
  }

  // Thanh toán khi nhận hàng (COD)
  async createPaymentForCashOnDelivery(orderId: string, amount: number) {
    // Tạo payment cho hình thức thanh toán khi nhận hàng (COD)
    const paymentPayload = {
      paymentCode: Date.now(),
      order: new Types.ObjectId(orderId),
      amount: amount,
      status: 'PENDING',
      transactionId: '',
    };
    return await this.paymentModel.create(paymentPayload);
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
    );
  }

  async createPaymentUrl(createPaymentDto: CreatePaymentDto, ip: string) {
    // Tạo đối tượng PayOS
    const payos = new PayOS({
      clientId: this.clientID,
      apiKey: this.apiKey,
      checksumKey: this.checkSum,
      logLevel: 'info',
      // ... other options
    });

    const paymentCode: number = Date.now(); // Sử dụng timestamp làm mã đơn hàng duy nhất
    const paymentLink = await payos.paymentRequests.create(
      {
        orderCode: paymentCode,
        amount: createPaymentDto.amount,
        expiredAt: Math.floor(Date.now() / 1000) + 15 * 60,
        description: 'Đơn hàng #' + paymentCode,
        returnUrl: this.returnUrl,
        cancelUrl: this.returnUrl,
      },
      {
        maxRetries: 5, // Override default max retries
        timeout: 10000, // Override default timeout
      },
    );

    return {
      url: paymentLink.checkoutUrl,
    };
  }

  // async verifyReturnUrl(vnpParams: any, guestId: string) {
  //   const paymentPayload = {
  //     order: new Types.ObjectId(vnpParams['vnp_TxnRef']),
  //     amount: parseInt(vnpParams['vnp_Amount']) || 0,
  //     status: 'PENDING',
  //     transactionId: vnpParams['vnp_TransactionNo'] || '',
  //   };
  //   try {
  //     // Tạo đối tượng VNPay với config giống như khi tạo payment
  //     const vnpay = new VNPay({
  //       // Cấu hình bắt buộc
  //       tmnCode: this.tmnCode,
  //       secureSecret: this.secretKey,
  //       vnpayHost: this.vnpUrl,

  //       // Cấu hình tùy chọn
  //       testMode: true, // chỉ bật khi chạy test
  //       hashAlgorithm: HashAlgorithm.SHA512, // Thuật toán mã hóa
  //       enableLog: true, // Bật/tắt log
  //       loggerFn: ignoreLogger, // Custom logger
  //     });
  //     // Sử dụng thư viện VNPay để verify
  //     const verify = vnpay.verifyReturnUrl(vnpParams);

  //     // // Tạo transactionData từ vnpParams
  //     // const transactionData: Record<string, string> = {
  //     //   orderId: vnpParams['vnp_TxnRef'] || '',
  //     //   totalAmount: vnpParams['vnp_Amount'] || '',
  //     //   orderInfo: vnpParams['vnp_OrderInfo'] || '',
  //     //   responseCode: vnpParams['vnp_ResponseCode'] || '',
  //     //   transactionNo: vnpParams['vnp_TransactionNo'] || '',
  //     //   bankCode: vnpParams['vnp_BankCode'] || '',
  //     //   bankTranNo: vnpParams['vnp_BankTranNo'] || '',
  //     //   cardType: vnpParams['vnp_CardType'] || '',
  //     //   payDate: vnpParams['vnp_PayDate'] || '',
  //     //   transactionStatus: vnpParams['vnp_TransactionStatus'] || '',
  //     // };
  //     if (verify) {
  //       const responseCode = vnpParams['vnp_ResponseCode'];
  //       if (responseCode === '00') {
  //         // Tạo payment thành công
  //         paymentPayload.status = 'PAID';

  //         const paymentCreated = await this.paymentModel.create(paymentPayload);

  //         // Gửi thông báo thành công về giao dịch qua email (Notification Service)
  //         this.notificationService.emit('notification.sendPaymentSuccess', {
  //           guestId: guestId,
  //           orderId: paymentPayload.order,
  //           amount: paymentPayload.amount,
  //         });

  //         return paymentCreated;
  //       } else {
  //         return {
  //           message: 'Giao dịch thất bại',
  //         };
  //       }
  //     } else {
  //       return {
  //         message: 'Chữ ký không hợp lệ',
  //       };
  //     }
  //   } catch (error) {
  //     console.error('VNPay verification error:', error);

  //     //  Xử lý lỗi ở dưới này....

  //     return {
  //       isValid: false,
  //       message: 'Lỗi xác thực giao dịch',
  //     };
  //   }
  // }
}
