import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { ProductCode, VNPay, VnpLocale } from 'vnpay';
import { CreatePaymentDto } from 'src/client/payment/payment.controller';
import { Order } from 'src/client/order/entities/order.entity';
import { Model } from 'mongoose';
import { Product } from 'src/admin/product/entities/product.entity';
import { Cart } from 'src/client/cart/entities/cart.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class VnpayService {
    private tmnCode: string;
    private secretKey: string;
    private vnpUrl: string;
    private returnUrl: string;
    private orderData: CreatePaymentDto;

    constructor(
        private configService: ConfigService,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(Cart.name) private cartModel: Model<Cart>,
    ) {
        this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE') || '';
        this.secretKey = this.configService.get<string>('VNPAY_SECRET_KEY') || '';
        this.vnpUrl = this.configService.get<string>('VNPAY_URL') || '';
        this.returnUrl = this.configService.get<string>('VNPAY_RETURN_URL') || '';
        this.orderData = {} as CreatePaymentDto;
    }

    async createPaymentUrl(createPaymentDto: CreatePaymentDto) {
        const { orderId, totalAmount, orderDescription } = createPaymentDto;
        this.orderData = createPaymentDto;
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

        // Tạo đối tượng VNPay
        const vnpay = new VNPay({
            tmnCode: this.tmnCode,
            secureSecret: this.secretKey,
            vnpayHost: this.vnpUrl,
            testMode: true, // chỉ bật khi chạy test
            // hashAlgorithm: undefined, // leave undefined or set to a valid value like 'sha512'
            loggerFn: console.log, // có thể thay bằng ignoreLogger
        });


        const vnpayResponse = await vnpay.buildPaymentUrl({
            vnp_Amount: totalAmount, // số tiền (đơn vị VNĐ × 100 -> 50000 = 500.00 VNĐ)
            vnp_IpAddr: '127.0.0.1',
            vnp_TxnRef: orderId, // mã giao dịch duy nhất
            vnp_OrderInfo: orderDescription,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: this.returnUrl,
            vnp_Locale: VnpLocale.VN, // hoặc VnpLocale.EN
            vnp_CreateDate: Number(createDate),
            vnp_ExpireDate: Number(expireDate), // hết hạn sau 15 phút
        });

        return { vnpayResponse };
    }

    async verifyReturnUrl(vnpParams: any): Promise<{ isValid: boolean; message: string; transactionData?: Record<string, string>; }> {
        try {
            // Tạo đối tượng VNPay với config giống như khi tạo payment
            const vnpay = new VNPay({
                tmnCode: this.tmnCode,
                secureSecret: this.secretKey,
                vnpayHost: this.vnpUrl,
                testMode: true,
                loggerFn: console.log,
            });

            // Sử dụng thư viện VNPay để verify
            const isValid = vnpay.verifyReturnUrl(vnpParams);

            // Tạo transactionData từ vnpParams
            const transactionData: Record<string, string> = {
                orderId: vnpParams['vnp_TxnRef'] || '',
                totalAmount: vnpParams['vnp_Amount'] || '',
                orderInfo: vnpParams['vnp_OrderInfo'] || '',
                responseCode: vnpParams['vnp_ResponseCode'] || '',
                transactionNo: vnpParams['vnp_TransactionNo'] || '',
                bankCode: vnpParams['vnp_BankCode'] || '',
                bankTranNo: vnpParams['vnp_BankTranNo'] || '',
                cardType: vnpParams['vnp_CardType'] || '',
                payDate: vnpParams['vnp_PayDate'] || '',
                transactionStatus: vnpParams['vnp_TransactionStatus'] || '',
            };

            if (isValid) {
                const responseCode = vnpParams['vnp_ResponseCode'];
                if (responseCode === '00') {
                    // Xu ly luu thong tin giao dich vao hoa don, cap nhat trang thai don hang, ...
                    const dataCreate = {
                        guestId: this.orderData.guestId,
                        customerInfo: {
                            fullname: this.orderData.customerInfo.fullname,
                            address: this.orderData.customerInfo.address,
                            email: this.orderData.customerInfo.email,
                            phone: this.orderData.customerInfo.phone,
                            note: this.orderData.customerInfo.note,
                        },
                        orderDetail: this.orderData.orderDetail.map(item => ({
                            product: item.product._id,
                            quantity: item.quantity,
                            subtotal: item.subtotal,
                            price: item.price,
                        })),
                        totalAmount: this.orderData.totalAmount,
                        payment: {
                            isCheckout: true,
                            type: 'CARD'
                        }
                    }

                    await Promise.all(this.orderData.orderDetail.map(async (item) => {
                        // Cập nhật số lượng đã bán và tồn kho của sản phẩm
                        await this.productModel.findByIdAndUpdate(item.product._id, { $inc: { soldCount: item.quantity, stock: -item.quantity } });
                    }));

                    // Xóa giỏ hàng sau khi tạo đơn hàng
                    await this.cartModel.findOneAndDelete({ guestId: this.orderData.guestId });

                    // Tao don hang
                    await this.orderModel.create(dataCreate);

                    return {
                        isValid: true,
                        message: 'Giao dịch thành công',
                        transactionData
                    };
                } else {
                    return {
                        isValid: false,
                        message: 'Giao dịch thất bại',
                        transactionData
                    };
                }
            } else {
                return {
                    isValid: false,
                    message: 'Chữ ký không hợp lệ',
                    transactionData
                };
            }
        } catch (error) {
            console.error('VNPay verification error:', error);
            return {
                isValid: false,
                message: 'Lỗi xác thực giao dịch'
            };
        }
    }
}