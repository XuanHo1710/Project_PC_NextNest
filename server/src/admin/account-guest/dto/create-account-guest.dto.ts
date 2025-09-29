import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsMongoId } from 'class-validator';

export class CreateAccountGuestDto {
    @IsMongoId()
    guestId: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    googleId?: string;

    @IsOptional()
    @IsEnum(['local', 'google'])
    authProvider?: string;

    @IsOptional()
    @IsEnum(['WEB', 'MOBILE', 'ADMIN'])
    registrationSource?: string;

    @IsOptional()
    @IsBoolean()
    termsAccepted?: boolean;

    @IsOptional()
    @IsBoolean()
    privacyPolicyAccepted?: boolean;

    @IsOptional()
    @IsBoolean()
    emailNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    smsNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    marketingEmails?: boolean;
}