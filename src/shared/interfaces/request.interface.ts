import { Request } from 'express';

export interface JwtPayloadUser {
  userId: string;
  telegramId: string;
}

export interface CustomUserRequest extends Request {
  user: JwtPayloadUser;
}
