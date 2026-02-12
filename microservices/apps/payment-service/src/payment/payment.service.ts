import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePaymentDto, MICROSERVICE } from '@project-pc/common';
import { VNPay, ignoreLogger } from 'vnpay';
import { HashAlgorithm, VnpLocale } from 'vnpay/enums';

import moment from 'moment';
import { Payment } from 'src/payment/entity/payment.entity';
import { ClientProxy } from '@nestjs/microservices';
@Injectable()
export class VnpayService {
  private tmnCode: string;
  private secretKey: string;
  private vnpUrl: string;
  private returnUrl: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @Inject(MICROSERVICE.NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
  ) {
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE') || '';
    this.secretKey = this.configService.get<string>('VNPAY_SECRET_KEY') || '';
    this.vnpUrl = this.configService.get<string>('VNPAY_URL') || '';
    this.returnUrl = this.configService.get<string>('VNPAY_RETURN_URL') || '';
  }

  // Thanh toán khi nhận hàng (COD)
  async createPaymentForCashOnDelivery(
    guestId: string,
    orderId: string,
    amount: number,
  ) {
    // Tạo payment cho hình thức thanh toán khi nhận hàng (COD)
    const paymentPayload = {
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
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');
    // Tạo đối tượng VNPay
    const vnpay = new VNPay({
      // Cấu hình bắt buộc
      tmnCode: this.tmnCode,
      secureSecret: this.secretKey,
      vnpayHost: this.vnpUrl,

      // Cấu hình tùy chọn
      testMode: true, // chỉ bật khi chạy test
      hashAlgorithm: HashAlgorithm.SHA512, // Thuật toán mã hóa
      enableLog: true, // Bật/tắt log
      loggerFn: ignoreLogger, // Custom logger

      // // Cấu hình các endpoint tùy chỉnh
      // endpoints: {
      //   paymentEndpoint: 'paymentv2/vpcpay.html',
      //   queryDrRefundEndpoint: 'merchant_webapi/api/transaction',
      //   getBankListEndpoint: 'qrpayauth/api/merchant/get_bank_list',
      // },
    });
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: createPaymentDto.amount,
      vnp_IpAddr: ip,
      vnp_ReturnUrl: this.returnUrl,
      vnp_TxnRef: createPaymentDto.order,
      vnp_OrderInfo: `Thanh toán đơn hàng #${createPaymentDto.order.toUpperCase()}`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: Number(createDate),
      vnp_ExpireDate: Number(expireDate),
    });

    return {
      url: paymentUrl,
    };
  }

  async verifyReturnUrl(vnpParams: any, guestId: string) {
    const paymentPayload = {
      order: new Types.ObjectId(vnpParams['vnp_TxnRef']),
      amount: parseInt(vnpParams['vnp_Amount']) || 0,
      status: 'PENDING',
      transactionId: vnpParams['vnp_TransactionNo'] || '',
    };
    try {
      // Tạo đối tượng VNPay với config giống như khi tạo payment
      const vnpay = new VNPay({
        // Cấu hình bắt buộc
        tmnCode: this.tmnCode,
        secureSecret: this.secretKey,
        vnpayHost: this.vnpUrl,

        // Cấu hình tùy chọn
        testMode: true, // chỉ bật khi chạy test
        hashAlgorithm: HashAlgorithm.SHA512, // Thuật toán mã hóa
        enableLog: true, // Bật/tắt log
        loggerFn: ignoreLogger, // Custom logger
      });
      // Sử dụng thư viện VNPay để verify
      const verify = vnpay.verifyReturnUrl(vnpParams);

      // // Tạo transactionData từ vnpParams
      // const transactionData: Record<string, string> = {
      //   orderId: vnpParams['vnp_TxnRef'] || '',
      //   totalAmount: vnpParams['vnp_Amount'] || '',
      //   orderInfo: vnpParams['vnp_OrderInfo'] || '',
      //   responseCode: vnpParams['vnp_ResponseCode'] || '',
      //   transactionNo: vnpParams['vnp_TransactionNo'] || '',
      //   bankCode: vnpParams['vnp_BankCode'] || '',
      //   bankTranNo: vnpParams['vnp_BankTranNo'] || '',
      //   cardType: vnpParams['vnp_CardType'] || '',
      //   payDate: vnpParams['vnp_PayDate'] || '',
      //   transactionStatus: vnpParams['vnp_TransactionStatus'] || '',
      // };
      if (verify) {
        const responseCode = vnpParams['vnp_ResponseCode'];
        if (responseCode === '00') {
          // Tạo payment thành công
          paymentPayload.status = 'PAID';

          const paymentCreated = await this.paymentModel.create(paymentPayload);

          // Gửi thông báo thành công về giao dịch qua email (Notification Service)
          this.notificationService.emit('notification.sendPaymentSuccess', {
            guestId: guestId,
            orderId: paymentPayload.order,
            amount: paymentPayload.amount,
          });

          return paymentCreated;
        } else {
          return {
            message: 'Giao dịch thất bại',
          };
        }
      } else {
        return {
          message: 'Chữ ký không hợp lệ',
        };
      }
    } catch (error) {
      console.error('VNPay verification error:', error);

      //  Xử lý lỗi ở dưới này....

      return {
        isValid: false,
        message: 'Lỗi xác thực giao dịch',
      };
    }
  }
}
