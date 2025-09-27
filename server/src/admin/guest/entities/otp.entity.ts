import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guest } from '../../guest/entities/guest.entity';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' })
    guestId?: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    otpCode: string;

    @Prop({
        enum: ['REGISTER', 'FORGOT_PASSWORD', 'CHANGE_EMAIL', 'LOGIN'],
        required: true
    })
    type: string;

    @Prop({ default: false })
    isUsed: boolean;

    @Prop()
    usedAt?: Date;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: 0 })
    resendCount: number; // Số lần gửi lại

    @Prop()
    lastResendAt?: Date;

    // IP address để security
    @Prop()
    requestIp?: string;

    // User agent để tracking
    @Prop()
    userAgent?: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Index để tối ưu query và auto delete
OtpSchema.index({ email: 1, type: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
OtpSchema.index({ guestId: 1 });