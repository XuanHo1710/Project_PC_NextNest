import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateProductAttributeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(['COLOR', 'IMAGE', 'BUTTON', 'RADIO'])
  displayType: string;
}
