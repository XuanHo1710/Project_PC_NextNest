import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountGuest } from 'src/account-guest/entities/account-guest.entity';
import { AccountGuestService } from 'src/account-guest/account-guest.service';
import { compareSync } from 'bcrypt';
const ms = require('ms');
@Injectable()
export class ClientAuthService {
  constructor(
    @InjectModel(AccountGuest.name)
    private accountGuestModel: Model<AccountGuest>,
    private accountGuestService: AccountGuestService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(email: string, password: string) {
    const guest = await this.accountGuestModel
      .findOne({
        email,
        deletedAt: { $exists: false },
        accountStatus: { $in: ['ACTIVE', 'PENDING'] },
      })
      .lean()
      .exec();

    if (!guest) return null;

    const isCorrect = compareSync(password, guest.password || '');
    if (guest && isCorrect) {
      return guest;
    } else {
      return null;
    }
  }

  async googleLogin(googleUser: any): Promise<any> {
    const { email, firstName, lastName, picture, googleId } = googleUser;

    // Tìm user trong database
    let guest = await this.accountGuestModel
      .findOne({
        $or: [{ email: email }, { googleId: googleId }],
        deletedAt: { $exists: false },
      })
      .lean()
      .exec();

    if (!guest) {
      // Tạo user mới nếu chưa tồn tại
      const result = await this.accountGuestService.create({
        fullname: `${firstName} ${lastName}`,
        email: email,
        avatar: picture,
        password: googleId + '@..sGH', // Sử dụng googleId làm mật khẩu tạm thời
        authProvider: 'google',
        googleId: googleId,
      });
      return result;
    } else {
      // Update thông tin nếu user đã tồn tại
      await this.accountGuestService.update(guest._id.toString(), {
        googleId: googleId,
        authProvider: 'google',
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
      });

      // Update guest profile - QUAN TRỌNG: Cập nhật authProvider trong Guest collection
      if (guest.email) {
        const loginDate = new Date();
        loginDate.setHours(0, 0, 0, 0);
        const result = await this.accountGuestModel.updateOne(
          {
            email: guest.email,
            'loginInformation.loginAt': loginDate,
          },
          {
            $inc: { 'loginInformation.$.loginCount': 1 },
          },
        );

        if (result.matchedCount === 0) {
          await this.accountGuestModel.updateOne(
            { email: guest.email },
            {
              $push: {
                loginInformation: {
                  loginAt: loginDate,
                  loginCount: 1,
                },
              },
            },
          );
        }

        // Update Guest collection authProvider
        await this.accountGuestModel.updateOne(
          { email: guest.email },
          {
            authProvider: 'google',
            googleId: googleId,
            avatar: picture || guest.avatar,
          },
        );
      }

      // Reload guest with updated data
      guest = await this.accountGuestService.getGuestById(guest._id.toString());
    }

    return guest;
  }

  async login(
    accountGuest: AccountGuest & { _id: mongoose.Schema.Types.ObjectId },
    response: Response,
    req?: any,
  ) {
    // Get populated guest data
    const guestWithProfile = await this.accountGuestModel
      .findById(accountGuest._id)
      .exec();

    if (!guestWithProfile) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    const payload = {
      _id: accountGuest._id.toString(),
      guestId: guestWithProfile._id.toString(),
      email: accountGuest.email,
      avatar: guestWithProfile?.avatar || '',
      accountStatus: accountGuest.accountStatus,
      fullname: guestWithProfile?.fullname || '',
      authProvider:
        guestWithProfile?.authProvider || accountGuest.authProvider || 'local',
    };

    const access_token = this.createAccessToken(payload);

    const refresh_token = this.jwtService.sign(
      payload as any,
      {
        secret:
          this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')! || '',
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
      } as SignOptions,
    );

    // Update login info
    await this.accountGuestService.updateLoginInfo(
      accountGuest._id.toString(),
      {
        ip: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers?.['user-agent'],
        token: access_token,
      },
    );

    // Set cookies
    response.cookie('client_refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(
        this.configService.get<string>('JWT_REFRESH_EXPIRE') as string,
      ),
    });

    response.cookie('client_access_token', access_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_ACCESS_EXPIRE') as string),
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: accountGuest._id,
        guestId: guestWithProfile._id,
        email: accountGuest.email,
        fullname: guestWithProfile?.fullname || '',
        avatar: guestWithProfile?.avatar || '',
        authProvider:
          guestWithProfile?.authProvider ||
          accountGuest.authProvider ||
          'local',
        accountStatus: accountGuest.accountStatus,
        isEmailVerified: accountGuest.isEmailVerified,
        phone: guestWithProfile?.phone || '',
        gender: guestWithProfile?.gender || 'OTHER',
      },
    };
  }

  async register(
    email: string,
    password: string,
    fullname: string,
    phone: string,
  ) {
    // Create Guest and AccountGuest together
    const result = await this.accountGuestService.create({
      fullname,
      email,
      phone: phone,
      password: password,
      authProvider: 'local',
      avatar: '',
    });

    return result;
  }

  async verifyEmail(token: string) {
    return await this.accountGuestService.verifyEmail(token);
  }

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      const detailPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const accountGuestData = await this.accountGuestService.findOne(
        detailPayload._id,
      );
      if (!accountGuestData) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }

      const accountGuest = await this.accountGuestModel
        .findById(accountGuestData._id)
        .lean()
        .exec();
      if (!accountGuest) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }

      const payload = {
        _id: accountGuest._id.toString(),
        guestId: accountGuest._id,
        email: accountGuest.email,
        avatar: accountGuest.avatar || '',
        accountStatus: accountGuest.accountStatus,
        fullname: accountGuest.fullname || '',
        authProvider: accountGuest.authProvider || 'local',
      };

      const access_token = this.createAccessToken(payload);

      // Set new access_token cookie
      await this.accountGuestModel
        .updateOne({ _id: accountGuest._id }, { verifyToken: access_token })
        .exec();

      response.cookie('client_access_token', access_token, {
        httpOnly: true,
        maxAge: ms(
          this.configService.get<string>('JWT_ACCESS_EXPIRE') as string,
        ),
      });

      return { access_token, ...payload };
    } catch (err) {
      throw new BadRequestException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  };

  createAccessToken = (payload: any) => {
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')! || '',
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE', '3600s')!,
    } as SignOptions);
    return access_token;
  };

  async logout(response: Response) {
    response.clearCookie('client_refresh_token');
    response.clearCookie('client_access_token');
    return { message: 'Đăng xuất thành công' };
  }
}
