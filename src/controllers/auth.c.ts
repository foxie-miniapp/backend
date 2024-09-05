import User from 'src/database/entities/user.entity';
import { HttpStatus } from 'src/shared/exceptions/enums/http-status.enum';
import { signToken } from 'src/utils/jwt';
import { NextFunction, Request, Response } from 'express';

import { BadRequestException } from '../shared/exceptions';
import { compareHash } from '../utils/bcrypt';
import logger from '../utils/logger';

class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new BadRequestException({
          details: [{ issue: 'Body must contain {email, password}' }],
        });
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        const newUser = new User({ email, password });
        await newUser.save();
      }

      const isCorrectPassword = compareHash(password, user.password);
      if (!isCorrectPassword) {
        throw new BadRequestException({
          details: [{ issue: 'Invalid password' }],
        });
      }

      const accessToken = signToken(user.id);

      // eslint-disable-next-line unused-imports/no-unused-vars
      const { password: pw, ...returnUser } = user.toObject();
      return res.status(HttpStatus.OK).json({ ...returnUser, accessToken });
    } catch (error: any) {
      logger.error(error.message);
      next(error);
    }
  }
}

export default new AuthController();
