import * as mongoose from 'mongoose';

import { config } from '../config/configuration';

const connectDB = async () => {
  await mongoose.connect(config.DATABASE_URI, {
    dbName: config.DATABASE_NAME,
    serverSelectionTimeoutMS: 30 * 1000, // 30 secs
    socketTimeoutMS: 30 * 1000, // 30 secs
    heartbeatFrequencyMS: 30 * 1000, // 30 secs
  });
};

export default connectDB;
