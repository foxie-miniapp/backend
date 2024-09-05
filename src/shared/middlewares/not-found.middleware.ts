import { NextFunction, Request, Response } from 'express';

import { NotFoundException } from '../exceptions';

const notFoundMiddleware = (_req: Request, _res: Response, _next: NextFunction) => {
  throw new NotFoundException();
};

export default notFoundMiddleware;
