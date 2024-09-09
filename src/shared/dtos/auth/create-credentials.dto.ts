import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCredentialsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, {
    message: 'Telegram ID must contain only numbers',
  })
  telegramId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  initData: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  code?: string;
}
