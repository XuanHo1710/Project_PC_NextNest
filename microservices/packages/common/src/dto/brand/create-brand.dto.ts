import { IsNotEmpty, IsOptional, IsString, IsEnum } from "class-validator";

export class CreateBrandDto {
  @IsNotEmpty({ message: "Tên thương hiệu không được để trống" })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEnum(["ACTIVE", "INACTIVE"])
  status?: string;
}
