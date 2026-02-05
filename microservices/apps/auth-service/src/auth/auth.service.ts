import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
import { MICROSERVICE } from 'src/contraint';
import Redis from 'ioredis';
const ms = require('ms');
@Injectable()
export class ClientAuthService {
  constructor(
    @InjectModel(AccountGuest.name)
    private accountGuestModel: Model<AccountGuest>,
    private accountGuestService: AccountGuestService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(MICROSERVICE.REDIS_SERVICE) private readonly redisClient: Redis,
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

  async login(accountGuest: AccountGuest) {
    const payload = {
      _id: accountGuest._id.toString(),
      guestId: accountGuest._id.toString(),
      email: accountGuest.email,
      avatar: accountGuest?.avatar || '',
      accountStatus: accountGuest.accountStatus,
      fullname: accountGuest?.fullname || '',
      authProvider:
        accountGuest?.authProvider || accountGuest.authProvider || 'local',
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
    await this.accountGuestService.updateLoginInfo(accountGuest._id.toString());

    // // Set cookies

    // Save refresh token in redis db
    const redisKey = `guest_refresh_token:${accountGuest._id.toString()}`;

    const existingToken = await this.redisClient.get(redisKey);
    if (existingToken) {
      await this.redisClient.del(redisKey);
    }
    await this.redisClient.set(
      redisKey,
      refresh_token,
      'EX',
      ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')!) / 1000,
    );
    console.log(`Refresh token stored in Redis for guest ${refresh_token}`);

    return {
      access_token,
      refresh_token,
      payload: payload,
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

  processNewToken = async (refreshToken: string) => {
    try {
      const detailPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      //  Check refresh token in redis
      const storedRefreshToken = await this.redisClient.get(
        `guest_refresh_token:${detailPayload._id}`,
      );

      const payload = this.jwtService.verify(storedRefreshToken!, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      if (!payload) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }

      const payloadFinal = {
        _id: payload._id,
        guestId: payload.guestId,
        email: payload.email,
        avatar: payload.avatar,
        accountStatus: payload.accountStatus,
        fullname: payload.fullname,
        authProvider: payload.authProvider,
      };

      const access_token = this.createAccessToken(payloadFinal);

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
