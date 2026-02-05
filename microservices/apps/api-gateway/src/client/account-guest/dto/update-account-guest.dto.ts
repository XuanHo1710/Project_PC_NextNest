import { PartialType } from '@nestjs/swagger';
import { CreateAccountGuestDto, ACCOUNT_STATUS } from '@project-pc/common';
import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';

export class UpdateAccountGuestDto extends PartialType(CreateAccountGuestDto) {
  @IsOptional()
  @IsEnum(ACCOUNT_STATUS)
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
  @IsString()
  adminNotes?: string;
}
