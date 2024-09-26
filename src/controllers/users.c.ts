import redisClient from 'src/config/redis-client';
import DailyReward from 'src/database/entities/daily-reward.entity';
import Quest, { QuestType } from 'src/database/entities/quest.entity';
import User from 'src/database/entities/user.entity';
import UserQuest, { QuestStatus } from 'src/database/entities/user-quest.entity';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { Validation } from 'src/shared/decorators/validation-pipe.decorator';
import { UpdateUserDto } from 'src/shared/dtos/user/update-user.dto';
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

      return res.status(HttpStatus.OK).json({
        claimed: dailyReward ? true : false,
      });
    } catch (error: any) {
      logger.error('Error in findMe:', error.message);
      next(error);
    }
  }
  @Auth()
  async claimDailyReward(req: CustomUserRequest, res: Response, next: NextFunction) {
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
      const userId = req.user?.userId;

      const [leaderboard, total, currentUser] = await Promise.all([
        User.find(
          {},
          {
            username: 1,
            points: 1,
            photoUrl: 1,
            firstName: 1,
            lastName: 1,
          }
        )
          .sort({ points: -1, username: 1 })
          .limit(100)
          .exec(),
        User.countDocuments(),
        User.findById(userId, {
          username: 1,
          points: 1,
          photoUrl: 1,
          firstName: 1,
          lastName: 1,
        }).exec(),
      ]);

      let currentUserRank = null;
      if (currentUser) {
        currentUserRank = await User.countDocuments({
          points: { $gt: currentUser.points },
        });
        currentUserRank += 1; // Rank is 1-based, so add 1
      }

      return res.status(HttpStatus.OK).json({
        data: leaderboard,
        total,
        user: {
          ...currentUser?.toObject(),
          rank: currentUserRank,
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
      const userId = req.user?.userId;

      const referents = await User.find(
        { referredBy: userId },
        {
          username: 1,
          firstName: 1,
          lastName: 1,
          points: 1,
          photoUrl: 1,
        }
      ).exec();

      return res.status(HttpStatus.OK).json(referents);
    } catch (error: any) {
      logger.error('Error: ', error.message);
      next(error);
    }
  }

  @Auth()
  @Validation(UpdateUserDto)
  async updateWalletAddress(req: CustomUserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { walletAddress } = req.body;

      if (!walletAddress) {
        throw new BadRequestException({ details: [{ issue: 'Wallet address is required' }] });
      }

      const user = await User.findOne({ _id: userId });

      if (!user) {
        throw new NotFoundException({ details: [{ issue: 'User not found' }] });
      }

      if (!user.walletAddress && walletAddress) {
        const quest = await Quest.findOne({ type: QuestType.CONNECT_WALLET });

        const userQuest = await UserQuest.findOne({ user: userId, quest: quest?._id });

        userQuest.status = QuestStatus.COMPLETED;
        await userQuest.save();
      }

      user.walletAddress = walletAddress;
      await user.save();

      await redisClient.del(`userId:${userId}`);

      return res.status(HttpStatus.OK).json(user);
    } catch (error: any) {
      logger.error('Error in updateWalletAddress:', error.message);
      next(error);
    }
  }
}

export default new UsersController();
