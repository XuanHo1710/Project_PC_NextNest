import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsStrongPassword,
  IsPhoneNumber,
} from "class-validator";

export class CreateAccountGuestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword(
    {},
    { message: "Phải có ít nhất 1 kí tự chữ, số, chữ hoa, đặc biệt" },
  )
  password!: string;

  @IsNotEmpty({ message: "Tên không được để trống" })
  fullname!: string;

  @IsOptional()
  @IsNotEmpty({ message: "Số điện thoại không được để trống" })
  @IsPhoneNumber("VN", { message: "Số điện thoại không hợp lệ" })
  phone?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsEnum(["local", "google"])
  authProvider?: string;

  @IsOptional()
  avatar?: string;
}
