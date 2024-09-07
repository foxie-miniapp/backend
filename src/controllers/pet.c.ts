import User from 'src/database/entities/user.entity';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { NotFoundException } from 'src/shared/exceptions';
import { HttpStatus } from 'src/shared/exceptions/enums/http-status.enum';
import { CustomUserRequest } from 'src/shared/interfaces/request.interface';
import logger from 'src/utils/logger';
import { NextFunction, Response } from 'express';

class PetController {
  @Auth()
  async feedPet(req: CustomUserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new NotFoundException({ details: [{ issue: 'User not found' }] });
      }

      const user = await User.findOneAndUpdate(
        { _id: userId, numberOfFoods: { $gte: 1 } },
        { $inc: { numberOfFoods: -1, exp: 10 } },
        { new: true }
      );

      if (!user) {
        throw new NotFoundException({ details: [{ issue: 'User not found' }] });
      }

      return res.status(HttpStatus.OK).json(user);
    } catch (error: unknown) {
      logger.error('Error in feedPet:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  }
}

export default new PetController();
