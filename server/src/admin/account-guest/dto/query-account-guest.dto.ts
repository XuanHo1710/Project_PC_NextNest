import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAccountGuestDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'])
    accountStatus?: string;

    @IsOptional()
    @IsEnum(['local', 'google'])
    authProvider?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isVerified?: boolean;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isEmailVerified?: boolean;

    @IsOptional()
    @IsEnum(['MALE', 'FEMALE', 'OTHER'])
    gender?: string;

    @IsOptional()
    @IsEnum(['WEB', 'MOBILE', 'ADMIN'])
    registrationSource?: string;

    @IsOptional()
    @IsDateString()
    createdFrom?: string;

    @IsOptional()
    @IsDateString()
    createdTo?: string;

    @IsOptional()
    @IsDateString()
    lastLoginFrom?: string;

    @IsOptional()
    @IsDateString()
    lastLoginTo?: string;

    @IsOptional()
    @IsEnum(['createdAt', 'lastLoginAt', 'fullname', 'email', 'loginCount'])
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}