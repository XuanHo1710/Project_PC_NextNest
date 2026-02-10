import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ToggleReactionDto {
  @IsString()
  @IsNotEmpty()
  commentId: string;

  @IsString()
  @IsOptional()
  guest?: string;

  @IsBoolean()
  @IsNotEmpty()
  isLike: boolean; // true = like, false = dislike
}
