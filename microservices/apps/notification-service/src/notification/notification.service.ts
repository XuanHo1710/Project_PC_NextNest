import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from '@project-pc/common';

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface BrevoResponse {
  messageId?: string;
  code?: string;
  message?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY') || '';
    this.senderEmail =
      this.configService.get<string>('BREVO_SENDER_EMAIL') || '';
    this.senderName = this.configService.get<string>('BREVO_SENDER_NAME') || '';

    if (!this.apiKey) {
      this.logger.warn(
        'BREVO_API_KEY is not configured. Emails will not be sent.',
      );
    }
  }

  async sendMail(email: string, orderId: string, description: string) {
    if (!this.apiKey) {
      this.logger.error('Cannot send email: BREVO_API_KEY is not configured');
      return false;
    }

    const htmlContent = this.generateOtpEmailTemplate('09321', 123);

    const success = await this.sendEmail({
      to: email,
      subject: `[${orderId}] Thông báo đơn hàng - Social Chat`,
      textContent: description,
      htmlContent,
    });

    return success;
  }

  /**
   * Send email using Brevo API
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.error('Cannot send email: BREVO_API_KEY is not configured');
      return false;
    }

    const payload = {
      sender: {
        name: this.senderName,
        email: this.senderEmail,
      },
      to: [{ email: options.to }],
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent || this.stripHtml(options.htmlContent),
    };

    try {
      const response = await fetch(this.brevoApiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data: BrevoResponse = await response.json();

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send OTP email for password reset
   * In dev mode or when email fails, OTP will be logged to console
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    expiresInMinutes: number = 5,
  ): Promise<boolean> {
    // Always log OTP in dev mode for testing
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    if (nodeEnv !== 'production') {
      this.logger.warn(
        `[DEV MODE] OTP for ${email}: ${otp} (expires in ${expiresInMinutes} min)`,
      );
    }

    // If no API key, skip email but return true for dev testing
    if (!this.apiKey) {
      return true; // Allow flow to continue in dev
    }

    const htmlContent = this.generateOtpEmailTemplate(otp, expiresInMinutes);

    const success = await this.sendEmail({
      to: email,
      subject: `[${otp}] Mã xác minh đặt lại mật khẩu - Social Chat`,
      htmlContent,
    });

    // If email fails, still log OTP for dev testing
    if (!success) {
      // Return true in non-production to allow testing
      return nodeEnv !== 'production';
    }

    return success;
  }

  /**
   * Send password reset success notification
   */
  async sendPasswordResetSuccessEmail(
    email: string,
    firstName: string,
  ): Promise<boolean> {
    const htmlContent = this.generatePasswordResetSuccessTemplate(firstName);

    return this.sendEmail({
      to: email,
      subject: 'Mật khẩu của bạn đã được thay đổi - Social Chat',
      htmlContent,
    });
  }

  /**
   * Generate OTP email template
   */
  private generateOtpEmailTemplate(
    otp: string,
    expiresInMinutes: number,
  ): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã xác minh OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1877f2 0%, #00c6ff 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Social Chat</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Khôi phục mật khẩu</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1c1e21; font-size: 24px; font-weight: 600; text-align: center;">
                Mã xác minh của bạn
              </h2>
              
              <p style="margin: 0 0 30px; color: #606770; font-size: 16px; line-height: 1.6; text-align: center;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Sử dụng mã OTP dưới đây để tiếp tục:
              </p>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px;">
                <p style="margin: 0 0 10px; color: #606770; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Mã xác minh</p>
                <div style="font-size: 40px; font-weight: 700; color: #1877f2; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <!-- Warning -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 15px 20px; margin: 0 0 30px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  ⏱️ <strong>Mã này sẽ hết hạn sau ${expiresInMinutes} phút.</strong><br>
                  Vui lòng không chia sẻ mã này với bất kỳ ai.
                </p>
              </div>
              
              <p style="margin: 0; color: #606770; font-size: 14px; line-height: 1.6; text-align: center;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi nếu bạn lo ngại về bảo mật tài khoản.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 10px; color: #606770; font-size: 14px;">
                Cảm ơn bạn đã sử dụng Social Chat!
              </p>
              <p style="margin: 0; color: #90949c; font-size: 12px;">
                © ${new Date().getFullYear()} Social Chat. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate password reset success template
   */
  private generatePasswordResetSuccessTemplate(firstName: string): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đổi mật khẩu thành công</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #42b72a 0%, #36d058 100%); border-radius: 16px 16px 0 0;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Đổi mật khẩu thành công!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1c1e21; font-size: 18px; font-weight: 600;">
                Xin chào ${firstName},
              </p>
              
              <p style="margin: 0 0 20px; color: #606770; font-size: 16px; line-height: 1.6;">
                Mật khẩu tài khoản Social Chat của bạn đã được thay đổi thành công.
              </p>
              
              <p style="margin: 0 0 30px; color: #606770; font-size: 16px; line-height: 1.6;">
                Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
              
              <!-- Security Warning -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 15px 20px; margin: 0 0 30px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  🔐 <strong>Nếu bạn không thực hiện thay đổi này</strong>, vui lòng liên hệ với chúng tôi ngay lập tức để bảo vệ tài khoản của bạn.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 10px; color: #606770; font-size: 14px;">
                Cảm ơn bạn đã sử dụng Social Chat!
              </p>
              <p style="margin: 0; color: #90949c; font-size: 12px;">
                © ${new Date().getFullYear()} Social Chat. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    email: string,
    orderId: string,
    amount: number,
    orderItems: Array<{
      productVariant: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>,
    paymentMethod: string,
    customerName?: string,
  ): Promise<boolean> {
    const htmlContent = this.generateOrderConfirmationTemplate(
      orderId,
      amount,
      orderItems,
      paymentMethod,
      customerName,
    );

    return this.sendEmail({
      to: email,
      subject: `[Project PC] Xác nhận đơn hàng #${orderId.slice(-8).toUpperCase()}`,
      htmlContent,
    });
  }

  /**
   * Generate order confirmation email template
   */
  private generateOrderConfirmationTemplate(
    orderId: string,
    amount: number,
    orderItems: Array<{
      productVariant: string;
      quantity: number;
      price: number;
      subtotal: number;
    }>,
    paymentMethod: string,
    customerName?: string,
  ): string {
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);

    const itemsHtml = orderItems
      .map(
        (item, index) => `
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 12px 16px; color: #495057; font-size: 14px;">${index + 1}</td>
          <td style="padding: 12px 16px; color: #495057; font-size: 14px;">${item.productVariant.slice(-8).toUpperCase()}</td>
          <td style="padding: 12px 16px; color: #495057; font-size: 14px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 16px; color: #495057; font-size: 14px; text-align: right;">${formatCurrency(item.price)}</td>
          <td style="padding: 12px 16px; color: #1877f2; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(item.subtotal)}</td>
        </tr>`,
      )
      .join('');

    const paymentMethodText =
      paymentMethod === 'CARD'
        ? 'Thanh toán trực tuyến (Đã thanh toán)'
        : 'Thanh toán khi nhận hàng (COD)';

    const paymentBadgeColor = paymentMethod === 'CARD' ? '#28a745' : '#fd7e14';

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đơn hàng</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 650px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1877f2 0%, #00c6ff 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Project PC</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Xác nhận đơn hàng</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 30px 40px 10px; text-align: center;">
              <div style="width: 70px; height: 70px; background-color: #d4edda; border-radius: 50%; margin: 0 auto 15px; line-height: 70px;">
                <span style="font-size: 36px;">✅</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #28a745; font-size: 24px; font-weight: 700;">
                Đặt hàng thành công!
              </h2>
              <p style="margin: 0; color: #606770; font-size: 16px;">
                ${customerName ? `Xin chào <strong>${customerName}</strong>, c` : 'C'}ảm ơn bạn đã đặt hàng tại Project PC
              </p>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #606770; font-size: 14px;">Mã đơn hàng:</td>
                    <td style="padding: 8px 0; color: #1877f2; font-size: 16px; font-weight: 700; text-align: right; letter-spacing: 1px;">#${orderId.slice(-8).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #606770; font-size: 14px;">Phương thức thanh toán:</td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="background-color: ${paymentBadgeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${paymentMethodText}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #606770; font-size: 14px;">Ngày đặt hàng:</td>
                    <td style="padding: 8px 0; color: #1c1e21; font-size: 14px; font-weight: 500; text-align: right;">${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 10px 40px 20px;">
              <h3 style="margin: 0 0 15px; color: #1c1e21; font-size: 18px; font-weight: 600;">Chi tiết đơn hàng</h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px 16px; color: #495057; font-size: 13px; text-align: left; font-weight: 600;">#</th>
                    <th style="padding: 12px 16px; color: #495057; font-size: 13px; text-align: left; font-weight: 600;">Mã SP</th>
                    <th style="padding: 12px 16px; color: #495057; font-size: 13px; text-align: center; font-weight: 600;">SL</th>
                    <th style="padding: 12px 16px; color: #495057; font-size: 13px; text-align: right; font-weight: 600;">Đơn giá</th>
                    <th style="padding: 12px 16px; color: #495057; font-size: 13px; text-align: right; font-weight: 600;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background: linear-gradient(135deg, #1877f2 0%, #00c6ff 100%); border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 5px; color: rgba(255,255,255,0.8); font-size: 14px;">Tổng thanh toán</p>
                <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">${formatCurrency(amount)}</p>
              </div>
            </td>
          </tr>

          <!-- Shipping Info -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 15px 20px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  🚚 <strong>Đơn hàng sẽ được xử lý và giao đến bạn trong 1-3 ngày làm việc.</strong><br>
                  Bạn sẽ nhận được thông báo khi đơn hàng được giao.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 5px; color: #606770; font-size: 14px;">
                Nếu có thắc mắc, vui lòng liên hệ hotline: <strong>1900-xxxx</strong>
              </p>
              <p style="margin: 0 0 10px; color: #606770; font-size: 14px;">
                Cảm ơn bạn đã mua sắm tại Project PC!
              </p>
              <p style="margin: 0; color: #90949c; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Project PC. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
