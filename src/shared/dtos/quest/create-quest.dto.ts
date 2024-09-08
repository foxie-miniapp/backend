import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { QuestLogo, QuestType } from 'src/database/entities/quest.entity';

export class CreateQuestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: QuestLogo;

  @IsString()
  @IsOptional()
  type: QuestType;

  @IsNumber()
  pointsReward: number;

  @IsString()
  @IsOptional()
  url?: string;
}
