import User from 'src/database/entities/user.entity';
import { NotFoundException } from 'src/shared/exceptions';
import { HttpStatus } from 'src/shared/exceptions/enums/http-status.enum';
import { CustomUserRequest } from 'src/shared/interfaces/request.interface';
import logger from 'src/utils/logger';
import { NextFunction, Response } from 'express';

class UsersController {
  async findMe(req: CustomUserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new NotFoundException({ details: [{ issue: 'User not found' }] });
      }

      const user = await User.findById(userId).select('-password');

      if (!user) {
        throw new NotFoundException({ details: [{ issue: 'User not found' }] });
      }

      return res.status(HttpStatus.OK).json(user);
    } catch (error: any) {
      logger.error('Error in findMe:', error.message);
      next(error);
    }
  }
}

export default new UsersController();
