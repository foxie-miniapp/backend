import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

import { BadRequestException } from '../exceptions';
import { ClientErrorDetails } from '../interfaces/common.interface';

export const Validation = (type: new () => object) => {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line unused-imports/no-unused-vars
    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      const object = plainToInstance(type, req.body);
      const errors = await validate(object);

      if (errors.length > 0) {
        const details: ClientErrorDetails[] = [];

        for (const error of errors) {
          const violatedConstraints: string[] = [];

          for (const constraint in error.constraints) {
            const message = error.constraints[constraint];
            violatedConstraints.push(message);
          }

          const clientErrorDetails = {
            field: error.property,
            issue: violatedConstraints.join(', '),
          };

          details.push(clientErrorDetails);
        }

        next(new BadRequestException({ details: details }));
      } else {
        // eslint-disable-next-line prefer-rest-params
        originalMethod.apply(this, arguments);
      }
    };
  };
};
