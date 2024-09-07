import { config } from 'src/config/configuration';
import { NextFunction, Request, Response } from 'express';

import { UnauthorizedException } from '../exceptions/unauthorized.exception';

export interface AdminAuthenticatedRequest extends Request {
  admin?: boolean;
}

export function Admin() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) {
      const adminToken = req.headers['X-Admin-Token'] as string;

      if (!adminToken || adminToken !== config.ADMIN_SECRET_TOKEN) {
        return next(new UnauthorizedException({ details: [{ issue: 'Invalid admin token' }] }));
      }

      req.admin = true;
      return originalMethod.apply(this, [req, res, next]);
    };

    return descriptor;
  };
}
