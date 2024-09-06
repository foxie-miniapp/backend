import * as mongoose from 'mongoose';

interface IUser extends Document {
  telegramId: string;
  username: string;
  // firstName?: string;
  // lastName?: string;
  // photoUrl?: string;
  points: number;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  telegramId: {
    required: true,
    type: String,
    unique: true,
  },

  username: {
    required: true,
    type: String,
  },

  // firtName: {
  //   type: String,
  // },

  // lastName: {
  //   type: String,
  // },

  // photoUrl: {
  //   type: String,
  // },

  points: {
    default: 0,
    type: Number,
  },

  referralCode: {
    required: true,
    type: String,
    unique: true,
  },

  referredBy: {
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  },

  lastLogin: {
    default: Date.now(),
    type: Date,
  },

  createdAt: {
    default: Date.now(),
    type: Date,
  },

  updatedAt: {
    default: Date.now(),
    type: Date,
  },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
