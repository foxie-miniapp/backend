import * as mongoose from 'mongoose';

// Quest Interface

export enum QuestLogo {
  X = 'x',
  YOUTUBE = 'youtube',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  TON = 'ton',
}

export enum QuestType {
  LINK = 'link',
  INVITE_FRIEND = 'invite_friend',
  CONNECT_WALLET = 'connect_wallet',
  JOIN_GROUP_TELEGRAM = 'join_group_telegram',
  ON_CHAIN = 'on_chain',
}

interface IQuest extends Document {
  title: string;
  description?: string;
  logo?: QuestLogo;
  type: QuestType;
  pointsReward: number;
  priority: number;
  url?: string;
  telegramGroupId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestSchema = new mongoose.Schema<IQuest>(
  {
    title: { type: String, required: true },
    description: { type: String },
    pointsReward: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    url: { type: String },
    logo: { type: String, enum: Object.values(QuestLogo) },
    type: { type: String, enum: Object.values(QuestType), default: QuestType.LINK },
    telegramGroupId: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const Quest = mongoose.model<IQuest>('Quest', QuestSchema);

export default Quest;
