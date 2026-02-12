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
   * Send verification email for account activation
   */
  async sendVerificationEmail(
    email: string,
    fullname: string,
    verificationToken: string,
  ): Promise<boolean> {
    const clientUrl =
      this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const apiUrl =
      this.configService.get<string>('API_URL') ||
      'http://localhost:8080/api/v1';
    const verifyUrl = `${apiUrl}/client/auth/verify-email?token=${verificationToken}`;

    const htmlContent = this.generateVerificationEmailTemplate(
      fullname,
      verifyUrl,
    );

    return this.sendEmail({
      to: email,
      subject: 'Kích hoạt tài khoản - Project PC',
      htmlContent,
    });
  }

  /**
   * Generate verification email template
   */
  private generateVerificationEmailTemplate(
    fullname: string,
    verifyUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kích hoạt tài khoản</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f9ff; -webkit-font-smoothing: antialiased;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">Project PC</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.85); font-size: 15px; font-weight: 400;">Xác thực tài khoản</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #1e293b; font-size: 18px; font-weight: 600;">
                Xin chào ${fullname},
              </p>

              <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.7;">
                Cảm ơn bạn đã đăng ký tài khoản tại <strong style="color: #2563eb;">Project PC</strong>. Để bắt đầu sử dụng tài khoản, vui lòng bấm nút bên dưới để kích hoạt:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                  Kích hoạt tài khoản
                </a>
              </div>

              <!-- Info -->
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 24px;">
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                  ⏱️ <strong>Link kích hoạt có hiệu lực trong 24 giờ.</strong><br>
                  Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
                </p>
              </div>

              <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6; text-align: center;">
                Nếu nút không hoạt động, hãy copy và paste link sau vào trình duyệt:<br>
                <a href="${verifyUrl}" style="color: #3b82f6; word-break: break-all; font-size: 12px;">${verifyUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">
                Cảm ơn bạn đã lựa chọn Project PC!
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
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

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
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
    paymentMethod: string,
    customerName?: string,
    transactionId?: string,
  ): Promise<boolean> {
    const htmlContent = this.generateOrderConfirmationTemplate(
      orderId,
      amount,
      orderItems,
      paymentMethod,
      customerName,
      transactionId,
    );

    return this.sendEmail({
      to: email,
      subject: `Xác nhận đơn hàng #${orderId.slice(-8).toUpperCase()} - Project PC`,
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
      productName?: string;
      combination?: Record<string, string>;
      quantity: number;
      price: number;
      subtotal: number;
    }>,
    paymentMethod: string,
    customerName?: string,
    transactionId?: string,
  ): string {
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);

    const orderDate = new Date();
    const formattedDate = orderDate.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const displayOrderCode = transactionId || orderId.slice(-8).toUpperCase();

    const itemsHtml = orderItems
      .map((item, index) => {
        const combinationText = item.combination
          ? Object.entries(item.combination)
              .map(([key, val]) => `${key}: ${val}`)
              .join(', ')
          : '';
        const productDisplay =
          item.productName || item.productVariant.slice(-8).toUpperCase();
        return `
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 14px 16px; color: #4a5568; font-size: 14px; text-align: center;">${index + 1}</td>
          <td style="padding: 14px 16px; font-size: 14px;">
            <div style="color: #2d3748; font-weight: 500;">${productDisplay}</div>
            ${combinationText ? `<div style="color: #a0aec0; font-size: 12px; margin-top: 4px;">${combinationText}</div>` : ''}
          </td>
          <td style="padding: 14px 16px; color: #4a5568; font-size: 14px; text-align: center;">${item.quantity}</td>
          <td style="padding: 14px 16px; color: #4a5568; font-size: 14px; text-align: right;">${formatCurrency(item.price)}</td>
          <td style="padding: 14px 16px; color: #2b6cb0; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(item.subtotal)}</td>
        </tr>`;
      })
      .join('');

    const paymentMethodText =
      paymentMethod === 'CARD'
        ? 'Thanh toán trực tuyến'
        : 'Thanh toán khi nhận hàng (COD)';

    const paymentBadgeColor = paymentMethod === 'CARD' ? '#38a169' : '#dd6b20';
    const paymentStatusSuffix =
      paymentMethod === 'CARD' ? ' - Đã thanh toán' : '';

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đơn hàng - Project PC</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" style="width: 100%; max-width: 640px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background-color: #2b6cb0; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Project PC</h1>
              <p style="margin: 8px 0 0; color: #bee3f8; font-size: 14px; font-weight: 400;">Xác nhận đơn hàng</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 16px;">
              <p style="margin: 0 0 8px; color: #2d3748; font-size: 16px; line-height: 1.6;">
                ${customerName ? `Xin chào <strong>${customerName}</strong>,` : 'Xin chào,'}
              </p>
              <p style="margin: 0; color: #718096; font-size: 15px; line-height: 1.6;">
                Cảm ơn bạn đã đặt hàng tại Project PC. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
              </p>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 16px 40px;">
              <table style="width: 100%; border-collapse: collapse; background-color: #f7fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 14px 20px; color: #718096; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Mã đơn hàng</td>
                  <td style="padding: 14px 20px; color: #2b6cb0; font-size: 15px; font-weight: 700; text-align: right; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.5px;">#${displayOrderCode}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #718096; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Phương thức thanh toán</td>
                  <td style="padding: 14px 20px; text-align: right; border-bottom: 1px solid #e2e8f0;">
                    <span style="background-color: ${paymentBadgeColor}; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">${paymentMethodText}${paymentStatusSuffix}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #718096; font-size: 14px;">Ngày đặt hàng</td>
                  <td style="padding: 14px 20px; color: #2d3748; font-size: 14px; font-weight: 500; text-align: right;">${formattedDate}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items Table -->
          <tr>
            <td style="padding: 24px 40px 16px;">
              <h3 style="margin: 0 0 12px; color: #2d3748; font-size: 16px; font-weight: 600;">Chi tiết đơn hàng</h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #edf2f7;">
                    <th style="padding: 12px 16px; color: #4a5568; font-size: 12px; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">#</th>
                    <th style="padding: 12px 16px; color: #4a5568; font-size: 12px; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Sản phẩm</th>
                    <th style="padding: 12px 16px; color: #4a5568; font-size: 12px; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">SL</th>
                    <th style="padding: 12px 16px; color: #4a5568; font-size: 12px; text-align: right; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Đơn giá</th>
                    <th style="padding: 12px 16px; color: #4a5568; font-size: 12px; text-align: right; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Thành tiền</th>
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
            <td style="padding: 0 40px 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px 20px; text-align: right;">
                    <span style="color: #718096; font-size: 14px; margin-right: 16px;">Tổng thanh toán:</span>
                    <span style="color: #e53e3e; font-size: 24px; font-weight: 700;">${formatCurrency(amount)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Notice -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <div style="background-color: #fffbeb; border-left: 3px solid #d69e2e; border-radius: 0 4px 4px 0; padding: 14px 18px;">
                <p style="margin: 0 0 4px; color: #744210; font-size: 14px; font-weight: 600;">
                  Đơn hàng sẽ được xử lý và giao đến bạn trong 1-3 ngày làm việc.
                </p>
                <p style="margin: 0; color: #975a16; font-size: 13px;">
                  Bạn sẽ nhận được thông báo khi đơn hàng được giao.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px; color: #718096; font-size: 13px;">
                Nếu có thắc mắc, vui lòng liên hệ hotline: <strong style="color: #2d3748;">1900-xxxx</strong>
              </p>
              <p style="margin: 0 0 8px; color: #718096; font-size: 13px;">
                Cảm ơn bạn đã mua sắm tại Project PC!
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 11px;">
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
