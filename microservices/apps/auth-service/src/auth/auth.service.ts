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
import { ClientProxy } from '@nestjs/microservices';
import * as crypto from 'crypto';
const ms = require('ms');

const BCRYPT_DUMMY_HASH =
  '$2a$10$C6UzMDM.H6dfI/f/IKcEeO7VTgxjrpU8k95Lxvtqk1PGCvXnLBDF6';

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
    @Inject(MICROSERVICE.NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
  ) {}

  async signIn(email: string, password: string) {
    email = String(email || '').trim().toLowerCase();

    const guest = await this.accountGuestModel
      .findOne({
        email,
        deletedAt: { $exists: false },
        accountStatus: { $in: ['ACTIVE', 'PENDING'] },
      })
      .select('+password')
      .lean()
      .exec();

    if (!guest) {
      compareSync(password || 'x', BCRYPT_DUMMY_HASH);
      return null;
    }

    const isCorrect = compareSync(password, guest.password || '');
    if (!isCorrect) return null;

    // Check if email is verified
    if (!guest.isEmailVerified) {
      // Regenerate token and resend verification email
      const { token, fullname } =
        await this.accountGuestService.regenerateVerificationToken(email);

      // Send verification email
      this.notificationService.emit('notification.sendVerificationEmail', {
        email: guest.email,
        fullname,
        verificationToken: token,
      });

      return {
        requireVerification: true,
        message:
          'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản.',
      };
    }

    return guest;
  }

  async googleLogin(googleUser: any): Promise<any> {
    const { email, firstName, lastName, picture, googleId } = googleUser;
    const emailVerified = (googleUser as any)?.email_verified === true;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Tìm user trong database
    let guest = await this.accountGuestModel
      .findOne({
        $or: [{ email: normalizedEmail }, { googleId: googleId }],
        deletedAt: { $exists: false },
      })
      .lean()
      .exec();

    if (!guest) {
      // Tạo user mới nếu chưa tồn tại
      const tempPassword = crypto.randomBytes(24).toString('hex');
      const result = await this.accountGuestService.create({
        fullname: `${firstName} ${lastName}`,
        email: normalizedEmail,
        avatar: picture,
        password: tempPassword,
        authProvider: 'google',
        googleId: googleId,
      });
      // Google accounts are already verified — activate immediately
      await this.accountGuestService.updateAuthState(
        (result as any)._id.toString(),
        {
          isEmailVerified: true,
          accountStatus: 'ACTIVE',
        },
      );
      return this.accountGuestService.getGuestById(
        (result as any)._id.toString(),
      );
    } else {
      // Link Google identity to the existing account.
      // Only auto-activate/verify when we can trust the email:
      // Google reports it verified, or the account was already verified.
      const canAutoVerify = emailVerified || guest.isEmailVerified === true;
      await this.accountGuestService.updateAuthState(guest._id.toString(), {
        googleId: googleId,
        authProvider: 'google',
        ...(canAutoVerify
          ? { isEmailVerified: true, accountStatus: 'ACTIVE' }
          : {}),
      });

      // Update guest profile - QUAN TRỌNG: Cập nhật authProvider trong Guest collection
      if (guest.email) {
        const loginDate = new Date();
        loginDate.setHours(0, 0, 0, 0);
        // mongoose v9 mis-types positional-array filters/updates; runtime is valid
        const result = await this.accountGuestModel.updateOne(
          {
            email: guest.email,
            'loginInformation.loginAt': loginDate,
          } as any,
          {
            $inc: { 'loginInformation.$.loginCount': 1 },
          } as any,
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
      phone: accountGuest.phone,
      gender: accountGuest.gender,
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
    email = String(email || '').trim().toLowerCase();
    const result = await this.accountGuestService.create({
      fullname,
      email,
      phone: phone,
      password: password,
      authProvider: 'local',
      avatar: '',
    });

    // Send verification email
    if (result && (result as any).emailVerificationToken) {
      this.notificationService.emit('notification.sendVerificationEmail', {
        email,
        fullname,
        verificationToken: (result as any).emailVerificationToken,
      });
    }

    return {
      message:
        'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.',
      requireVerification: true,
    };
  }

  async verifyEmail(token: string) {
    return await this.accountGuestService.verifyEmail(token);
  }

  async processNewToken(refreshToken: string) {
    try {
      // Verify the PRESENTED refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const userId = payload?._id?.toString?.() ?? String(payload?._id);
      if (!userId) {
        throw new BadRequestException('Refresh token không hợp lệ');
      }

      // Proof-of-possession: the presented token must match the stored one
      const stored = await this.redisClient.get(`guest_refresh_token:${userId}`);
      if (!stored || stored !== refreshToken) {
        throw new BadRequestException('Phiên đăng nhập không hợp lệ');
      }

      const accountGuest = await this.accountGuestService.findByEmail(
        payload.email,
      );

      if (!accountGuest) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }

      // Suspended/banned accounts must not mint new tokens
      if (accountGuest.accountStatus && accountGuest.accountStatus !== 'ACTIVE') {
        await this.redisClient.del(`guest_refresh_token:${userId}`);
        throw new BadRequestException('Tài khoản đã bị khóa hoặc chưa kích hoạt');
      }

      const payloadFinal = {
        _id: accountGuest._id.toString(),
        guestId: accountGuest._id.toString(),
        email: accountGuest.email,
        avatar: accountGuest?.avatar || '',
        accountStatus: accountGuest.accountStatus,
        fullname: accountGuest?.fullname || '',
        authProvider: accountGuest.authProvider || 'local',
        phone: accountGuest.phone,
        gender: accountGuest.gender,
      };

      const access_token = this.createAccessToken(payloadFinal);

      // Rotate: issue a NEW refresh token and overwrite the stored one
      const refresh_token = this.jwtService.sign(payloadFinal as any, {
        secret:
          this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')! || '',
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
      } as SignOptions);

      await this.redisClient.set(
        `guest_refresh_token:${userId}`,
        refresh_token,
        'EX',
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')!) / 1000,
      );

      return { access_token, refresh_token, payload: payloadFinal };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
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
    return { message: 'Đăng xuất thành công' };
  }

  // Handle for admin service login
  async loginAdmin(account: AccountEmployee) {
    const payload = {
      IDEmp: account.IDEmp,
      username: account.name,
      roleId: account.roleId,
      employeeId: account._id,
      avatar: account?.avatar || '',
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
    try {
      // Verify the PRESENTED refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const userId = payload?._id?.toString?.() ?? String(payload?._id);
      if (!userId) {
        throw new BadRequestException('Refresh token không hợp lệ');
      }

      // Proof-of-possession: the presented token must match the stored one
      const stored = await this.redisClient.get(`admin_refresh_token:${userId}`);
      if (!stored || stored !== refreshToken) {
        throw new BadRequestException('Phiên đăng nhập không hợp lệ');
      }

      const accountEmployee =
        await this.accountEmployeeService.findAccountByIDEmp(payload.IDEmp);

      if (!accountEmployee) {
        throw new BadRequestException('Tài khoản không tồn tại');
      }

      // Suspended employees must not mint new tokens
      if (
        (accountEmployee as any).accountStatus &&
        (accountEmployee as any).accountStatus !== 'ACTIVE'
      ) {
        await this.redisClient.del(`admin_refresh_token:${userId}`);
        throw new BadRequestException('Tài khoản đã bị khóa');
      }

      const payloadFinal = {
        IDEmp: accountEmployee.IDEmp,
        username: accountEmployee.name,
        roleId: accountEmployee.roleId,
        employeeId: accountEmployee._id,
        _id: accountEmployee._id.toString(),
        avatar: accountEmployee.avatar || '',
      };

      const access_token = this.createAccessToken(payloadFinal);

      // Rotate: issue a NEW refresh token and overwrite the stored one
      const refresh_token = this.jwtService.sign(payloadFinal as any, {
        secret:
          this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')! || '',
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
      } as SignOptions);

      await this.redisClient.set(
        `admin_refresh_token:${userId}`,
        refresh_token,
        'EX',
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')!) / 1000,
      );

      return { access_token, refresh_token, payload: payloadFinal };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }

  async logoutAdmin(id: string) {
    // Remove refresh token from redis
    const redisKey = `admin_refresh_token:${id}`;
    await this.redisClient.del(redisKey);
    return { message: 'Đăng xuất thành công' };
  }

  async signInAdmin(IDEmp: string, password: string) {
    const account =
      await this.accountEmployeeService.findAccountByIDEmpWithPassword(IDEmp);
    if (!account) {
      compareSync(password || 'x', BCRYPT_DUMMY_HASH);
      return null;
    }
    const isCorrect = compareSync(password, account.password || '');
    if (account && isCorrect) {
      return account;
    } else {
      return null;
    }
  }

  async changePasswordAdmin(id: string, body: any) {
    const { currentPassword, newPassword } = body;
    const account =
      await this.accountEmployeeService.findByIdWithPassword(id);
    if (!account) throw new BadRequestException('Tài khoản không tồn tại');

    const isMatch = compareSync(currentPassword, account.password);
    if (!isMatch) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    // accountEmployeeService.update() hashes the password itself
    // (bcrypt.hashSync, saltRounds=10) — pass plaintext, never pre-hash.
    return await this.accountEmployeeService.update(
      new mongoose.Types.ObjectId(id),
      { password: newPassword } as any,
    );
  }
}
