import Quest from 'src/database/entities/quest.entity';
import User from 'src/database/entities/user.entity';
import UserQuest, { QuestStatus } from 'src/database/entities/user-quest.entity';
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

      const users = await User.find({});

      const userQuestPromises = users.map((user) => {
        const userQuest = new UserQuest({
          user: user._id,
          quest: newQuest._id,
          status: QuestStatus.IN_PROGRESS,
        });
        return userQuest.save();
      });

      await Promise.all(userQuestPromises);

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
      const quests = userQuests.map((userQuest) => {
        return {
          ...userQuest.quest,
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
      const { questId } = req.body;
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
}

export default new QuestController();
