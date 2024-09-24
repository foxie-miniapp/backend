import * as Bull from 'bull';
import { config } from 'src/config/configuration';
import Quest, { QuestType } from 'src/database/entities/quest.entity';
import Referral from 'src/database/entities/referral.entity';
import User from 'src/database/entities/user.entity';
import UserQuest, { QuestStatus } from 'src/database/entities/user-quest.entity';
import { BullService } from 'src/shared/bull/bull-service';

interface ReferralTask {
  userId: string;
  referralCode: string;
}

class ReferralWorker {
  private bullService: BullService;

  constructor() {
    const referralQueue = new Bull('referralQueue', {
      redis: {
        port: Number(config.REDIS_PORT),
        host: String(config.REDIS_HOST),
      },
    });

    this.bullService = new BullService(referralQueue, this.processReferral.bind(this));
  }

  private async processReferral(job: Bull.Job<ReferralTask>): Promise<void> {
    const { userId, referralCode } = job.data;

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        throw new Error(`Referrer not found for code: ${referralCode}`);
      }

      user.referredBy = referrer._id;
      await user.save();

      const referral = new Referral({
        referrer: referrer._id,
        referred: user._id,
      });
      await referral.save();

      const referrerReferrals = await Referral.find({ referrer: referrer._id });

      if (referrerReferrals.length === 5) {
        const quest = await Quest.findOne({ type: QuestType.INVITE_FRIEND });

        const userQuest = await UserQuest.findOne({
          user: referrer._id,
          quest: quest._id,
        });

        if (userQuest.status === QuestStatus.COMPLETED || userQuest.status === QuestStatus.CLAIMED) {
          return;
        }

        userQuest.status = QuestStatus.COMPLETED;
        await userQuest.save();
      }

      console.log(`Processed referral for user ${userId} with referral code ${referralCode}`);
    } catch (error) {
      console.error('Error processing referral:', error);
      throw error; // Rethrow the error so Bull knows the job failed
    }
  }

  async addReferralTask(userId: string, referralCode: string): Promise<void> {
    await this.bullService.addTask({ userId, referralCode });
  }
}

export const referralWorker = new ReferralWorker();
