import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import mongoose from 'mongoose';
import { AccountGuest } from '../../admin/account-guest/entities/account-guest.entity';
import { AccountGuestService } from '../../admin/account-guest/account-guest.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guest, GuestDocument } from '../../admin/guest/entities/guest.entity';
const bcrypt = require('bcrypt');
const ms = require("ms");

@Injectable()
export class ClientAuthService {
    constructor(
        @InjectModel(AccountGuest.name) private accountGuestModel: Model<AccountGuest>,
        @InjectModel(Guest.name) private guestModel: Model<GuestDocument>,
        private accountGuestService: AccountGuestService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async signIn(email: string, password: string): Promise<any | null> {
        const guest = await this.accountGuestModel.findOne({
            email,
            deletedAt: { $exists: false },
            accountStatus: { $in: ['ACTIVE', 'PENDING'] }
        }).exec();

        if (!guest) return null;

        // // Check if account is locked
        // if (guest.lockedUntil && guest.lockedUntil > new Date()) {
        //     throw new BadRequestException('Tài khoản đã bị khóa tạm thời');
        // }

        const isCorrect = bcrypt.compareSync(password, guest.password || "");
        if (guest && isCorrect) {
            // Reset failed login attempts on successful login
            if (guest.failedLoginAttempts > 0) {
                await this.accountGuestService.updateLoginInfo(guest._id.toString(), {});
            }
            return guest;
        } else {
            // Increment failed login attempts
            await this.accountGuestService.incrementFailedLoginAttempts(email);
            return null;
        }
    }

    async googleLogin(googleUser: any): Promise<any> {
        const { email, firstName, lastName, picture, googleId } = googleUser;

        // Tìm user trong database
        let guest = await this.accountGuestModel.findOne({
            $or: [
                { email: email },
                { googleId: googleId }
            ],
            deletedAt: { $exists: false }
        }).exec();

        if (!guest) {
            // Tạo user mới nếu chưa tồn tại
            const result = await this.accountGuestService.createGuestWithAccount(
                {
                    fullname: `${firstName} ${lastName}`,
                    email: email,
                    avatar: picture
                },
                {
                    googleId: googleId,
                    authProvider: 'google',
                    registrationSource: 'WEB',
                    termsAccepted: true,
                    privacyPolicyAccepted: true
                }
            );
            guest = await this.accountGuestModel.findById((result.account as any)._id).populate('guestId').exec();
        } else {
            // Update thông tin nếu user đã tồn tại
            await this.accountGuestService.update(guest._id.toString(), {
                googleId: googleId,
                authProvider: 'google',
                isEmailVerified: true,
                accountStatus: 'ACTIVE'
            });

            // Update guest profile - QUAN TRỌNG: Cập nhật authProvider trong Guest collection
            if (guest.guestId) {
                await this.accountGuestModel.updateOne(
                    { _id: guest._id },
                    { lastLoginAt: new Date() }
                );

                // Update Guest collection authProvider
                const guestId = (guest.guestId as any)._id || guest.guestId;
                await this.guestModel.updateOne(
                    { _id: guestId },
                    {
                        authProvider: 'google',
                        googleId: googleId,
                        avatar: picture || (guest.guestId as any).avatar
                    }
                );
            }

            // Reload guest with updated data
            guest = await this.accountGuestModel.findById(guest._id).populate('guestId').exec();
        }

        return guest;
    }

    async login(accountGuest: AccountGuest & { _id: mongoose.Schema.Types.ObjectId }, response: Response, req?: any) {
        // Get populated guest data
        const guestWithProfile = await this.accountGuestModel
            .findById(accountGuest._id)
            .populate('guestId')
            .exec();

        const guestProfile = guestWithProfile?.guestId as any;

        const payload = {
            _id: accountGuest._id.toString(),
            guestId: guestProfile._id.toString(),
            email: accountGuest.email,
            avatar: guestProfile?.avatar || '',
            accountStatus: accountGuest.accountStatus,
            fullname: guestProfile?.fullname || '',
            authProvider: guestProfile?.authProvider || accountGuest.authProvider || 'local'
        };

        const access_token = this.createAccessToken(payload);

        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE')
        });

        // Update login info
        await this.accountGuestService.updateLoginInfo(accountGuest._id.toString(), {
            ip: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.headers?.['user-agent'],
            token: access_token
        });

        // Set cookies
        response.cookie("client_refresh_token", refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE') as string)
        });

        response.cookie("client_access_token", access_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('JWT_ACCESS_EXPIRE') as string),
        });

        return {
            access_token,
            refresh_token,
            user: {
                id: accountGuest._id,
                guestId: guestProfile?._id,
                email: accountGuest.email,
                fullname: guestProfile?.fullname || '',
                avatar: guestProfile?.avatar || '',
                authProvider: guestProfile?.authProvider || accountGuest.authProvider || 'local',
                accountStatus: accountGuest.accountStatus,
                isEmailVerified: accountGuest.isEmailVerified,
                phone: guestProfile?.phone || '',
                gender: guestProfile?.gender || 'OTHER'
            }
        };
    }

    async register(email: string, password: string, fullname: string, phone: string, additionalData?: any) {
        // Create Guest and AccountGuest together
        const result = await this.accountGuestService.createGuestWithAccount(
            {
                fullname,
                email,
                phone: phone,
                avatar: additionalData?.avatar,
                gender: additionalData?.gender || 'OTHER',
                birthday: additionalData?.birthday
            },
            {
                password,
                authProvider: 'local',
                registrationSource: 'WEB',
                termsAccepted: additionalData?.termsAccepted || false,
                privacyPolicyAccepted: additionalData?.privacyPolicyAccepted || false,
                emailNotifications: additionalData?.emailNotifications ?? true,
                smsNotifications: additionalData?.smsNotifications ?? true,
                marketingEmails: additionalData?.marketingEmails ?? false
            }
        );

        return result;
    }

    async verifyEmail(token: string) {
        return await this.accountGuestService.verifyEmail(token);
    }

    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            const detailPayload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
            });

            const accountGuestData = await this.accountGuestService.findOne(detailPayload._id);
            if (!accountGuestData) {
                throw new BadRequestException("Tài khoản không tồn tại");
            }

            const accountGuest = await this.accountGuestModel.findById((accountGuestData as any)._id).populate('guestId').exec();
            if (!accountGuest) {
                throw new BadRequestException("Tài khoản không tồn tại");
            }

            const guestProfile = accountGuest.guestId as any; // This will be populated
            const payload = {
                _id: accountGuest._id.toString(),
                guestId: guestProfile._id,
                email: accountGuest.email,
                avatar: guestProfile?.avatar || '',
                accountStatus: accountGuest.accountStatus,
                fullname: guestProfile?.fullname || '',
                authProvider: accountGuest.authProvider || 'local'
            };

            const access_token = this.createAccessToken(payload);

            // Set new access_token cookie
            await this.accountGuestModel.updateOne({ _id: accountGuest._id }, { verifyToken: access_token }).exec();

            response.cookie("client_access_token", access_token, {
                httpOnly: true,
                maxAge: ms(this.configService.get<string>('JWT_ACCESS_EXPIRE') as string),
            });

            return { access_token, ...payload };

        } catch (err) {
            throw new BadRequestException("Refresh token không hợp lệ hoặc đã hết hạn");
        }
    }

    createAccessToken = (payload: any) => {
        const access_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE')
        });
        return access_token;
    }

    async logout(response: Response) {
        response.clearCookie("client_refresh_token");
        response.clearCookie("client_access_token");
        return { message: "Đăng xuất thành công" };
    }
}