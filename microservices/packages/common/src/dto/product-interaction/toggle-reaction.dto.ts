import { IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";

export class ToggleReactionDto {
  @IsMongoId()
  @IsNotEmpty()
  commentId: string;

  @IsMongoId()
  @IsNotEmpty()
  guest?: string;

  @IsBoolean()
  @IsNotEmpty()
  isLike: boolean; // true = like, false = dislike
}
