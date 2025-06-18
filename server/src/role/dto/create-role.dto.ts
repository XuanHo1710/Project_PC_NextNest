import { IsNotEmpty } from "class-validator";

export class CreateRoleDto {
    @IsNotEmpty({ message: "Tên vai trò không được để trống" })
    name: string;

    description: string;
    permission: [
        {
            method: string,
            path: string
        }
    ];
}
