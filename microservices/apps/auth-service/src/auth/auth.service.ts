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
import { MICROSERVICE } from '@project-pc/common';
import Redis from 'ioredis';
import { AccountEmployee } from 'src/account-employee/entities/account-employee.entity';
import { AccountEmployeeService } from 'src/account-employee/account-employee.service';
const ms = require('ms');
@Injectable()
export class ClientAuthService {
  constructor(
    @InjectModel(AccountGuest.name)
    private accountGuestModel: Model<AccountGuest>,
    private accountGuestService: AccountGuestService,
    private accountEmployeeService: AccountEmployeeService,
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
            avatar: guest.avatar || picture,
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

    // Set cookies
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

  async processNewToken(refreshToken: string) {
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
  }

  createAccessToken = (payload: any) => {
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')! || '',
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE', '3600s')!,
    } as SignOptions);
    return access_token;
  };

  async logout(id: string) {
    // Remove refresh token from redis
    const redisKey = `guest_refresh_token:${id}`;
    await this.redisClient.del(redisKey);
    console.log(`Refresh token deleted from Redis for guest ${id}`);
    return { message: 'Đăng xuất thành công' };
  }

  // Handle for admin service login
  async loginAdmin(account: AccountEmployee) {
    const payload = {
      IDEmp: account.IDEmp,
      username: account.name,
      roleId: account.roleId,
      employeeId: account._id,
      _id: account._id.toString(),
    };

    const access_token = this.createAccessToken(payload);

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
    } as SignOptions);

    // Save refresh token in redis db
    const redisKey = `admin_refresh_token:${account._id.toString()}`;

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

    return {
      access_token,
      refresh_token,
      payload,
    };
  }

  async processNewTokenAdmin(refreshToken: string) {
    console.log('Refresh token nè kakakak');

    try {
      const detailPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      //  Check refresh token in redis
      const storedRefreshToken = await this.redisClient.get(
        `admin_refresh_token:${detailPayload._id}`,
      );

      const payload = this.jwtService.verify(storedRefreshToken!, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      if (!payload) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }

      const payloadFinal = {
        IDEmp: detailPayload.IDEmp,
        username: detailPayload.username,
        roleId: detailPayload.roleId,
        employeeId: detailPayload.employeeId,
        _id: detailPayload._id.toString(),
      };

      const access_token = this.createAccessToken(payloadFinal);

      return { access_token, ...payloadFinal };
    } catch (err) {
      throw new BadRequestException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }

  async logoutAdmin(id: string) {
    // Remove refresh token from redis
    const redisKey = `admin_refresh_token:${id}`;
    await this.redisClient.del(redisKey);
    console.log(`Refresh token deleted from Redis for admin ${id}`);
    return { message: 'Đăng xuất thành công' };
  }

  async signInAdmin(IDEmp: string, password: string) {
    const account = await this.accountEmployeeService.findAccountByIDEmp(IDEmp);
    if (!account) return null;
    const isCorrect = compareSync(password, account.password || '');
    if (account && isCorrect) {
      return account;
    } else {
      return null;
    }
  }
}
