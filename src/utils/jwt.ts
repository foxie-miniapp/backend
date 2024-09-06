import * as jwt from 'jsonwebtoken';

import { config } from '../config/configuration';
import { JwtPayloadUser } from '../shared/interfaces/request.interface';

export const signToken = (payload: Pick<JwtPayloadUser, 'userId' | 'telegramId'>): string => {
  return jwt.sign(payload, config.JWT_SECRET_KEY, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.JWT_SECRET_KEY) as JwtPayloadUser;
};
