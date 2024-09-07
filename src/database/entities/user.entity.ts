import * as mongoose from 'mongoose';

interface IUser extends Document {
  telegramId: string;
  username: string;
  // firstName?: string;
  // lastName?: string;
  // photoUrl?: string;
  points: number;
  exp: number;
  numberOfFoods: number;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
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

    exp: {
      default: 0,
      type: Number,
    },

    numberOfFoods: {
      default: 0,
      type: Number,
    },

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
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
