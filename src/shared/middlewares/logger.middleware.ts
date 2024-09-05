import { NextFunction, Request, Response } from 'express';

import logger from '../../utils/logger';

const loggerMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    logger.debug({ query: { ...req.query }, params: { ...req.params } });
  }
  if (req.method === 'POST') {
    logger.debug({ body: req.body });
  }
  next();
};

export default loggerMiddleware;
