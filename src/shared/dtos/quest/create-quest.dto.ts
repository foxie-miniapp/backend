import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsNumber()
  pointsReward: number;

  @IsNumber()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  url?: string;
}
