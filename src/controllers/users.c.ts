import DailyReward from 'src/database/entities/daily-reward.entity';
import User from 'src/database/entities/user.entity';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { BadRequestException, NotFoundException } from 'src/shared/exceptions';
import { HttpStatus } from 'src/shared/exceptions/enums/http-status.enum';
import { CustomUserRequest } from 'src/shared/interfaces/request.interface';
import { dailyRewardPoints } from 'src/shared/points';
import logger from 'src/utils/logger';
import { NextFunction, Response } from 'express';

class UsersController {
  @Auth()
  async findMe(req: CustomUserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new NotFoundException({ details: [{ issue: 'User not found' }] });
      }

      const user = await User.findOne({
        _id: userId,
      });

      if (!user) {
        throw new NotFoundException({ details: [{ issue: 'User not found' }] });
      }

      return res.status(HttpStatus.OK).json(user);
    } catch (error: any) {
      logger.error('Error in findMe:', error.message);
      next(error);
    }
  }

  @Auth()
  async dailyReward(req: CustomUserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;

      const today = new Date().toISOString().slice(0, 10);
      const dailyReward = await DailyReward.findOne({ userId: userId, date: today });

      if (dailyReward) {
        throw new BadRequestException({ details: [{ issue: 'Already claimed' }] });
      }

      const user = await User.findOne({ _id: userId });

      await User.updateOne(
        { _id: userId },
        {
          $inc: { numberOfFoods: 1, points: dailyRewardPoints(user.exp) },
        }
      );

      await DailyReward.create([{ userId: userId, date: today }]);

      return res.status(HttpStatus.OK).json();
    } catch (error: any) {
      logger.error('Error in findMe:', error.message);
      next(error);
    }
  }
}

export default new UsersController();
