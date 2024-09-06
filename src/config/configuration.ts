import * as dotenv from 'dotenv';
dotenv.config();

class Config {
  PORT = +process.env.PORT! || 8000;
  JWT_SECRET_KEY = process.env.JWT_SECRET_KEY!;
  JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME!;
  NODE_ENV = process.env.NODE_ENV!;
  DATABASE_URI = process.env.DATABASE_URI!;
  DATABASE_NAME = process.env.DATABASE_NAME!;
  TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
}

export const config = new Config();
