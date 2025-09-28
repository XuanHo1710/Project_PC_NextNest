import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import mongoose from 'mongoose';
import { Guest } from '../../admin/guest/entities/guest.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const bcrypt = require('bcrypt');
const ms = require("ms");

@Injectable()
export class ClientAuthService {
    constructor(
        @InjectModel(Guest.name) private guestModel: Model<Guest>,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async signIn(email: string, password: string): Promise<any | null> {
        const guest = await this.guestModel.findOne({ email }).exec();
        if (!guest) return null;

        const isCorrect = bcrypt.compareSync(password, guest.password || "");
        if (guest && isCorrect) {
            return guest;
        }
        return null;
    }

    async googleLogin(googleUser: any): Promise<any> {
        const { email, firstName, lastName, picture, googleId } = googleUser;

        // Tìm user trong database
        let guest = await this.guestModel.findOne({
            $or: [
                { email: email },
                { googleId: googleId }
            ]
        }).exec();

        if (!guest) {
            // Tạo user mới nếu chưa tồn tại
            guest = new this.guestModel({
                email: email,
                fullname: `${firstName} ${lastName}`,
                googleId: googleId,
                avatar: picture,
                isActive: true,
                isEmailVerified: true, // Google email đã được verify
                authProvider: 'google'
            });
            await guest.save();
        } else {
            // Update thông tin nếu user đã tồn tại
            await this.guestModel.findByIdAndUpdate(guest._id, {
                googleId: googleId,
                avatar: picture,
                authProvider: 'google',
                isEmailVerified: true,
                lastLoginAt: new Date()
            });

            // Reload guest with updated data
            guest = await this.guestModel.findById(guest._id).exec();
        }

        return guest;
    }

    async login(guest: Guest & { _id: mongoose.Schema.Types.ObjectId }, response: Response) {
        const payload = {
            guestId: guest._id.toString(),
            email: guest.email,
            fullname: guest.fullname,
            authProvider: (guest as any).authProvider || 'local'
        };

        const access_token = this.createAccessToken(payload);

        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE')
        });

        // Update last login
        await this.guestModel.findByIdAndUpdate(guest._id, {
            lastLoginAt: new Date(),
            updatedAt: new Date()
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
                id: guest._id,
                email: guest.email,
                fullname: guest.fullname,
                avatar: guest.avatar,
                authProvider: (guest as any).authProvider || 'local'
            }
        };
    }

    async register(email: string, password: string, fullname: string) {
        // Check if user already exists
        const existingGuest = await this.guestModel.findOne({ email }).exec();
        if (existingGuest) {
            throw new BadRequestException('Email đã được sử dụng');
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create new guest
        const newGuest = new this.guestModel({
            email,
            password: hashedPassword,
            fullname,
            isActive: true,
            isEmailVerified: false,
            authProvider: 'local'
        });

        await newGuest.save();
        return newGuest;
    }

    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            const detailPayload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
            });

            const guest = await this.guestModel.findById(detailPayload.guestId).exec();
            if (!guest) {
                throw new BadRequestException("Tài khoản không tồn tại");
            }

            const payload = {
                guestId: guest._id.toString(),
                email: guest.email,
                fullname: guest.fullname,
                authProvider: (guest as any).authProvider || 'local'
            };

            const access_token = this.createAccessToken(payload);

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