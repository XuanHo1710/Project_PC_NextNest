import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountGuestDto } from './create-account-guest.dto';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';

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
  adminNotes?: string;
}
