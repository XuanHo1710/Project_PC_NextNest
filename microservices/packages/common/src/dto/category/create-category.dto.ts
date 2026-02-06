import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  parentId: string;
}
