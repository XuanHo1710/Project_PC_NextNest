import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsStrongPassword,
  Max,
  Min,
} from "class-validator";

export class CreateAccountEmployeeDto {
  @IsNotEmpty({ message: "Mã số nhân viên không được để trống" })
  IDEmp: string;

  @IsNotEmpty({ message: "Mật khẩu không được để trống" })
  @IsStrongPassword(
    {},
    { message: "Phải có ít nhất 1 kí tự chữ, số, chữ hoa, đặc biệt" },
  )
  password: string;

  @IsNotEmpty({ message: "Quyền không được để trống" })
  roleId: string;

  status: string; //ACTIVE, INACTIVE

  @IsNotEmpty({ message: "Họ và tên không được để trống" })
  name: string;

  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;

  @IsNotEmpty({ message: "Tuổi không được để trống" })
  @IsNumber({}, { message: "Tuổi phải là một số" })
  @Max(100, { message: "Tuổi phải nhỏ hơn hoặc bằng 100" })
  @Min(18, { message: "Tuổi phải lớn hơn hoặc bằng 18" })
  age: number;

  gender: string;

  addresses?: Array<{
    _id?: string; // MongoDB sẽ tự tạo _id
    label: string;
    province: { code: number; name: string };
    district: { code: number; name: string };
    ward: { code: number; name: string };
    detailAddress: string;
    isDefault: boolean;
  }>;
}
