import redisClient from 'src/config/redis-client';
import Quest from 'src/database/entities/quest.entity';
import UserQuest, { QuestStatus } from 'src/database/entities/user-quest.entity';
import { questWorker } from 'src/jobs/quest.worker';
import { Admin, AdminAuthenticatedRequest } from 'src/shared/decorators/admin.decorator';
import { Auth, AuthenticatedRequest } from 'src/shared/decorators/auth.decorator';
import { Validation } from 'src/shared/decorators/validation-pipe.decorator';
import { CreateQuestDto } from 'src/shared/dtos/quest/create-quest.dto';
import { BadRequestException } from 'src/shared/exceptions';
import { HttpStatus } from 'src/shared/exceptions/enums/http-status.enum';
import { NextFunction, Response } from 'express';

class QuestController {
  @Admin()
  @Validation(CreateQuestDto)
  async createQuest(req: AdminAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateQuestDto;

      const newQuest = new Quest(dto);
      await newQuest.save();

      await questWorker.addCreateUserQuestsForNewQuestTask(newQuest._id.toString());

      return res.status(HttpStatus.CREATED).json(newQuest);
    } catch (error) {
      next(error);
    }
  }

  @Auth()
  async getQuests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;

      const userQuests = await UserQuest.find({ user: userId }).populate('quest');

      const quests = userQuests.map((userQuest: any) => {
        return {
          ...userQuest.quest.toObject(),
          status: userQuest.status,
        };
      });

      res.status(HttpStatus.OK).json(quests);
    } catch (error) {
      next(error);
    }
  }

  @Auth()
  async completeQuest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { questId } = req.params;
      const userId = req.user.userId;

      const quest = await Quest.findById(questId);
      if (!quest) {
        next(new BadRequestException({ details: [{ issue: 'Quest not found' }] }));
      }

      let userQuest = await UserQuest.findOne({ user: userId, quest: questId });
      if (!userQuest) {
        userQuest = new UserQuest({ user: userId, quest: questId });
      }

      if (userQuest.status === QuestStatus.COMPLETED || userQuest.status === QuestStatus.CLAIMED) {
        next(new BadRequestException({ details: [{ issue: 'Quest already completed or claimed' }] }));
      }

      userQuest.status = QuestStatus.COMPLETED;
      await userQuest.save();

      res.status(HttpStatus.OK).json({ message: 'Quest completed successfully' });
    } catch (error) {
      next(error);
    }
  }

  @Auth()
  async claimQuest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { questId } = req.params;
      const userId = req.user.userId;

      const userQuest = (await UserQuest.findOne({ user: userId, quest: questId }).populate('quest')) as any;
      if (!userQuest) {
        return res.status(404).json({ message: 'Quest not found for this user' });
      }

      if (userQuest.status !== QuestStatus.COMPLETED) {
        return res.status(400).json({ message: 'Quest not completed' });
      }

      await questWorker.addProcessQuestRewardsTask(userQuest._id.toString());
      await redisClient.del(`userId:${userId}`);
      res.status(HttpStatus.OK).json({
        message: 'Quest claimed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  @Admin()
  async deleteQuest(req: AdminAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { questId } = req.params;

      const quest = await Quest.findByIdAndDelete(questId);
      if (!quest) {
        next(new BadRequestException({ details: [{ issue: 'Quest not found' }] }));
      }

      await questWorker.addDeleteUserQuestsForQuestTask(questId);

      res.status(HttpStatus.OK).json({ message: 'Quest deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new QuestController();
