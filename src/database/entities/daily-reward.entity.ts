import * as mongoose from 'mongoose';

interface IDailyReward extends Document {
  userId: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const dailyRewardSchema = new mongoose.Schema<IDailyReward>(
  {
    userId: {
      required: true,
      type: String,
    },
    date: {
      required: true,
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

dailyRewardSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyReward = mongoose.model<IDailyReward>('DailyReward', dailyRewardSchema);

export default DailyReward;
