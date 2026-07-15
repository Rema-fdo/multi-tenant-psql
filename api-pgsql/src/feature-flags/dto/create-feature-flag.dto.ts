import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateFeatureFlagDto {
  // Keep keys predictable: lowercase letters, numbers, underscores.
  @IsString()
  @Matches(/^[a-z0-9_]+$/, {
    message: 'key may only contain lowercase letters, numbers and underscores',
  })
  @MaxLength(60)
  key!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
