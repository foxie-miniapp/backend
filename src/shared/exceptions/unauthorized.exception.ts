import { ClientErrorDetails } from '../interfaces/common.interface';

import { HttpStatus } from './enums/http-status.enum';
import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(body: { details: ClientErrorDetails[] }) {
    super(body.details, HttpStatus.UNAUTHORIZED);
    this.message = 'Unauthorized Exception';
  }
}
