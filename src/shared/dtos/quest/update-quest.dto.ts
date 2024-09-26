import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { QuestLogo, QuestType } from 'src/database/entities/quest.entity';

export class UpdateQuestDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: QuestLogo;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  type?: QuestType;

  @IsNumber()
  @IsOptional()
  pointsReward?: number;

  @IsString()
  @IsOptional()
  url?: string;
}
