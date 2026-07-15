import { IsString, Matches } from 'class-validator';

export class CheckFeatureDto {
  @IsString()
  @Matches(/^[a-z0-9_]+$/, {
    message: 'key may only contain lowercase letters, numbers and underscores',
  })
  key!: string;
}
