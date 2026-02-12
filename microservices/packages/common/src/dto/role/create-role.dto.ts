import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

class PermissionDto {
  @IsString()
  method: string;

  @IsString()
  path: string;
}

export class CreateRoleDto {
  @IsNotEmpty({ message: "Tên vai trò không được để trống" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "Mô tả vai trò không được để trống" })
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permission: Array<PermissionDto>;
}
