import redisClient from 'src/config/redis-client';
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

      const cacheKey = `userId:${userId}`;
      const cachedUser = await redisClient.get(cacheKey);

      if (cachedUser) {
        return res.status(HttpStatus.OK).json(JSON.parse(cachedUser));
      }

      if (!userId) {
        throw new NotFoundException({ details: [{ issue: 'User not found' }] });
      }

      const user = await User.findOne({
        _id: userId,
      });

      if (!user) {
        throw new NotFoundException({ details: [{ issue: 'User not found' }] });
      }

      await redisClient.set(cacheKey, JSON.stringify(user), 'EX', 3600);
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
      await redisClient.del(`userId:${userId}`);

      return res.status(HttpStatus.OK).json();
    } catch (error: any) {
      logger.error('Error in findMe:', error.message);
      next(error);
    }
  }

  @Auth()
  async getLeaderboard(req: CustomUserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const skip = (page - 1) * limit;
      const userId = req.user?.userId;

      const [leaderboard, total, currentUser] = await Promise.all([
        User.find({}, 'username points').sort({ points: -1, username: 1 }).skip(skip).limit(limit).exec(),
        User.countDocuments(),
        User.findById(userId, 'username points').exec(),
      ]);

      return res.status(HttpStatus.OK).json({
        data: leaderboard,
        user: currentUser,
        pagination: {
          currentPage: page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
      });
    } catch (error: any) {
      logger.error('Error in getLeaderboard:', error.message);
      next(error);
    }
  }

  @Auth()
  async getReferents(req: CustomUserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const skip = (page - 1) * limit;
      const userId = req.user?.userId;

      const referents = await User.find(
        { referredBy: userId },
        {
          username: 1,
          points: 1,
          photoUrl: 1,
        }
      )
        .skip(skip)
        .limit(limit)
        .exec();

      return res.status(HttpStatus.OK).json({
        data: referents,
        pagination: {
          currentPage: page,
          limit,
          totalPages: Math.ceil(referents.length / limit),
          totalItems: referents.length,
        },
      });
    } catch (error: any) {
      logger.error('Error in findMe:', error.message);
      next(error);
    }
  }
}

export default new UsersController();
