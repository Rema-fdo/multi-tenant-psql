import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateFeatureFlagDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]+$/, {
    message: 'key may only contain lowercase letters, numbers and underscores',
  })
  @MaxLength(60)
  key?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
