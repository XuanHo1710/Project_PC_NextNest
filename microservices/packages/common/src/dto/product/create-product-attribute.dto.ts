import { IsString, IsEnum, IsMongoId, IsOptional } from "class-validator";

export class CreateProductAttributeDto {
  @IsString()
  name: string;

  @IsEnum(["COLOR", "IMAGE", "BUTTON", "RADIO"])
  displayType: string;

  @IsMongoId()
  @IsOptional()
  createdBy?: string;
}
