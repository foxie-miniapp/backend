import * as mongoose from 'mongoose';

// Quest Interface
interface IQuest extends Document {
  title: string;
  description?: string;
  logo?: string;
  pointsReward: number;
  url?: string;
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
    url: { type: String },
    logo: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const Quest = mongoose.model<IQuest>('Quest', QuestSchema);

export default Quest;
