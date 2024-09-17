import * as Bull from 'bull';
import { config } from 'src/config/configuration';
import Quest from 'src/database/entities/quest.entity';
import User from 'src/database/entities/user.entity';
import UserQuest, { QuestStatus } from 'src/database/entities/user-quest.entity';
import { BullService } from 'src/shared/bull/bull-service';

type TaskType =
  | 'CREATE_USER_QUESTS'
  | 'UPDATE_QUEST_STATUS'
  | 'PROCESS_QUEST_REWARDS'
  | 'CREATE_USER_QUESTS_FOR_NEW_QUEST'
  | 'DELETE_USER_QUESTS_FOR_QUEST';

interface QuestTask {
  type: TaskType;
  data: any;
}

class QuestWorker {
  private bullService: BullService;

  constructor() {
    const questQueue = new Bull('questQueue', {
      redis: {
        port: Number(config.REDIS_PORT),
        host: String(config.REDIS_HOST),
      },
    });

    this.bullService = new BullService(questQueue, this.processTask.bind(this));
  }

  private async processTask(job: Bull.Job<QuestTask>): Promise<void> {
    const { type, data } = job.data;

    switch (type) {
      case 'CREATE_USER_QUESTS':
        await this.createUserQuests(data.userId);
        break;
      case 'UPDATE_QUEST_STATUS':
        await this.updateQuestStatus(data.userQuestId, data.newStatus);
        break;
      case 'PROCESS_QUEST_REWARDS':
        await this.processQuestRewards(data.userQuestId);
        break;
      case 'CREATE_USER_QUESTS_FOR_NEW_QUEST':
        await this.createUserQuestsForNewQuest(data.questId);
        break;
      case 'DELETE_USER_QUESTS_FOR_QUEST':
        await this.deleteUserQuestsForQuest(data.questId);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  private async createUserQuestsForNewQuest(questId: string): Promise<void> {
    const quest = await Quest.findById(questId);
    if (!quest) {
      throw new Error(`Quest not found: ${questId}`);
    }

    const users = await User.find({});

    const userQuestPromises = users.map((user) =>
      UserQuest.create({
        user: user._id,
        quest: questId,
        status: QuestStatus.IN_PROGRESS,
      })
    );

    await Promise.all(userQuestPromises);
    console.log(`Created UserQuest entries for quest: ${questId} for all users`);
  }

  private async createUserQuests(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const activeQuests = await Quest.find({ isActive: true });

    const userQuestPromises = activeQuests.map((quest) =>
      UserQuest.findOneAndUpdate(
        { user: userId, quest: quest._id },
        {
          user: userId,
          quest: quest._id,
          status: QuestStatus.IN_PROGRESS,
        },
        { upsert: true, new: true }
      )
    );

    await Promise.all(userQuestPromises);
    console.log(`Created UserQuest entries for user: ${userId}`);
  }

  private async updateQuestStatus(userQuestId: string, newStatus: string): Promise<void> {
    const userQuest = await UserQuest.findByIdAndUpdate(userQuestId, { status: newStatus }, { new: true });

    if (!userQuest) {
      throw new Error(`UserQuest not found: ${userQuestId}`);
    }

    console.log(`Updated UserQuest ${userQuestId} status to ${newStatus}`);
  }

  private async processQuestRewards(userQuestId: string): Promise<void> {
    const userQuest = await UserQuest.findById(userQuestId).populate('user quest');
    if (!userQuest) {
      throw new Error(`UserQuest not found: ${userQuestId}`);
    }

    const { user, quest }: any = userQuest;

    if (userQuest.status !== QuestStatus.COMPLETED) {
      throw new Error(`UserQuest ${userQuestId} is not completed`);
    }

    // Add points to the user
    user.points += quest.pointsReward;

    // Check if the user was referred and add bonus points to referrer
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const bonusPoints = Math.floor(quest.pointsReward * 0.1); // 10% bonus
        referrer.points += bonusPoints;
        await referrer.save();
      }
    }

    // Mark the quest as claimed
    userQuest.status = QuestStatus.CLAIMED;
    userQuest.claimedAt = new Date();

    await Promise.all([user.save(), userQuest.save()]);
    console.log(`Processed rewards for UserQuest ${userQuestId}`);
  }

  private async deleteUserQuestsForQuest(questId: string): Promise<void> {
    await UserQuest.deleteMany({ quest: questId });

    console.log(`Deleted UserQuest entries for quest: ${questId}`);
  }

  // Public methods to add tasks to the queue
  async addCreateUserQuestsTask(userId: string): Promise<void> {
    await this.bullService.addTask({ type: 'CREATE_USER_QUESTS', data: { userId } });
  }

  async addUpdateQuestStatusTask(userQuestId: string, newStatus: string): Promise<void> {
    await this.bullService.addTask({ type: 'UPDATE_QUEST_STATUS', data: { userQuestId, newStatus } });
  }

  async addProcessQuestRewardsTask(userQuestId: string): Promise<void> {
    await this.bullService.addTask({ type: 'PROCESS_QUEST_REWARDS', data: { userQuestId } });
  }

  async addCreateUserQuestsForNewQuestTask(questId: string): Promise<void> {
    await this.bullService.addTask({ type: 'CREATE_USER_QUESTS_FOR_NEW_QUEST', data: { questId } });
  }

  async addDeleteUserQuestsForQuestTask(questId: string): Promise<void> {
    await this.bullService.addTask({ type: 'DELETE_USER_QUESTS_FOR_QUEST', data: { questId } });
  }
}

export const questWorker = new QuestWorker();
