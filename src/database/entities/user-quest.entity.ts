import * as mongoose from 'mongoose';

export enum QuestStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLAIMED = 'claimed',
}

interface IUserQuest extends Document {
  user: mongoose.Types.ObjectId;
  quest: mongoose.Types.ObjectId;
  status: QuestStatus;
  completedAt?: Date;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserQuestSchema = new mongoose.Schema<IUserQuest>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest', required: true },
    status: { type: String, enum: QuestStatus, default: QuestStatus.IN_PROGRESS },
    completedAt: { type: Date },
    claimedAt: { type: Date },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const UserQuest = mongoose.model<IUserQuest>('UserQuest', UserQuestSchema);

export default UserQuest;
