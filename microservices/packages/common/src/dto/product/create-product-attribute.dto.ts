import { IsString, IsEnum } from "class-validator";

export class CreateProductAttributeDto {
  @IsString()
  name: string;

  @IsEnum(["COLOR", "IMAGE", "BUTTON", "RADIO"])
  displayType: string;
}
