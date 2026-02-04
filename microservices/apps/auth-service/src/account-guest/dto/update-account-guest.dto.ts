import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountGuestDto } from './create-account-guest.dto';
import { IsOptional, IsEnum, IsBoolean, IsNumber, IsString, IsDateString } from 'class-validator';

export class UpdateAccountGuestDto extends PartialType(CreateAccountGuestDto) {
    @IsOptional()
    @IsEnum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'])
    accountStatus?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;

    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;

    @IsOptional()
    @IsNumber()
    profileCompletionPercentage?: number;

    @IsOptional()
    @IsBoolean()
    twoFactorEnabled?: boolean;

    @IsOptional()
    @IsNumber()
    failedLoginAttempts?: number;

    @IsOptional()
    @IsDateString()
    lockedUntil?: string;

    @IsOptional()
    @IsString()
    adminNotes?: string;

    @IsOptional()
    @IsDateString()
    lastLoginAt?: string;

    @IsOptional()
    @IsNumber()
    loginCount?: number;

    @IsOptional()
    @IsString()
    lastLoginIP?: string;

    @IsOptional()
    @IsString()
    userAgent?: string;
}