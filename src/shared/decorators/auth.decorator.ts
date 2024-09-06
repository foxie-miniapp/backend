import { verifyToken } from 'src/utils/jwt';
import { NextFunction, Request, Response } from 'express';

import { UnauthorizedException } from '../exceptions/unauthorized.exception';
import { JwtPayloadUser } from '../interfaces/request.interface';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayloadUser; // You can define a more specific type for your user object
}

export function Auth() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (req: AuthenticatedRequest, res: Response, next: NextFunction) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next(
          new UnauthorizedException({
            details: [{ issue: 'Authorization header is required' }],
          })
        );
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        return next(
          new UnauthorizedException({
            details: [{ issue: 'Invalid authorization header' }],
          })
        );
      }

      try {
        const decoded = verifyToken(token);
        req.user = decoded;
        return originalMethod.apply(this, [req, res, next]);
      } catch (error) {
        return next(
          new UnauthorizedException({
            details: [{ issue: 'Invalid token or expire token' }],
          })
        );
      }
    };

    return descriptor;
  };
}
