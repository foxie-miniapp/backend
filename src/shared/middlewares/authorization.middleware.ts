import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../../utils/jwt';
import logger from '../../utils/logger';
import { CustomUserRequest } from '../interfaces/request.interface';

const authorizationMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const _req = req as CustomUserRequest;
    const accessToken = req?.headers?.authorization || '';
    const payload = verifyToken(accessToken.split('Bearer ')[1].trim());
    _req.user = payload;
    logger.info({ accessToken, payload });
    next();
  } catch (error: any) {
    next();
  }
};

export default authorizationMiddleware;
