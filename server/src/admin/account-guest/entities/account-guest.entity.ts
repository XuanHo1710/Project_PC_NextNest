import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AccountGuestDocument = HydratedDocument<AccountGuest>;

@Schema({ timestamps: true })
export class AccountGuest {
    // Reference to Guest profile
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true, unique: true })
    guestId: mongoose.Schema.Types.ObjectId;

    // Authentication fields only
    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    password?: string;

    // Google OAuth fields
    @Prop()
    googleId?: string;

    @Prop({ enum: ['local', 'google'], default: 'local' })
    authProvider: string;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop()
    verifyToken?: string;

    @Prop()
    resetPasswordToken?: string;

    @Prop()
    resetPasswordExpires?: Date;

    // Account status and security
    @Prop({ enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'], default: 'PENDING' })
    accountStatus: string;

    @Prop({ default: true })
    isActive: boolean;

    // Email verification
    @Prop()
    emailVerificationToken?: string;

    @Prop()
    emailVerificationExpires?: Date;

    // Security and login tracking
    @Prop()
    twoFactorSecret?: string;

    @Prop({ default: false })
    twoFactorEnabled: boolean;

    @Prop()
    lastLoginAt?: Date;

    @Prop({ default: 0 })
    loginCount: number;

    @Prop()
    lastLoginIP?: string;

    @Prop()
    userAgent?: string;

    // Account locks
    @Prop({ default: 0 })
    failedLoginAttempts: number;

    @Prop()
    lockedUntil?: Date;

    // Registration and terms
    @Prop({ enum: ['WEB', 'MOBILE', 'ADMIN'], default: 'WEB' })
    registrationSource: string;

    @Prop({ default: false })
    termsAccepted: boolean;

    @Prop()
    termsAcceptedAt?: Date;

    @Prop({ default: false })
    privacyPolicyAccepted: boolean;

    @Prop()
    privacyPolicyAcceptedAt?: Date;

    // Notification preferences
    @Prop({ default: true })
    emailNotifications: boolean;

    @Prop({ default: true })
    smsNotifications: boolean;

    @Prop({ default: true })
    marketingEmails: boolean;

    // Admin fields
    @Prop()
    adminNotes?: string;

    // Soft delete
    @Prop()
    deletedAt?: Date;

    @Prop()
    deletedBy?: mongoose.Schema.Types.ObjectId;
}

export const AccountGuestSchema = SchemaFactory.createForClass(AccountGuest);

// Indexes for better performance
AccountGuestSchema.index({ email: 1 });
AccountGuestSchema.index({ googleId: 1 });
AccountGuestSchema.index({ guestId: 1 });
AccountGuestSchema.index({ accountStatus: 1 });
AccountGuestSchema.index({ isActive: 1 });
AccountGuestSchema.index({ createdAt: -1 });
AccountGuestSchema.index({ lastLoginAt: -1 });

// Auto-populate Guest when querying AccountGuest
AccountGuestSchema.pre(/^find/, function (this: any) {
    this.populate('guestId');
});