import { validate } from '@telegram-apps/init-data-node';
import { config } from 'src/config/configuration';
import User from 'src/database/entities/user.entity';
import { generateReferralCode } from 'src/helpers/referral.helper';
import { questWorker } from 'src/jobs/quest.worker';
import { referralWorker } from 'src/jobs/referral.worker';
import { Validation } from 'src/shared/decorators/validation-pipe.decorator';
import { CreateCredentialsDto } from 'src/shared/dtos/auth/create-credentials.dto';
import { HttpStatus } from 'src/shared/exceptions/enums/http-status.enum';
import { signToken } from 'src/utils/jwt';
import { NextFunction, Request, Response } from 'express';

import logger from '../utils/logger';

class AuthController {
  @Validation(CreateCredentialsDto)
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateCredentialsDto;
      validate(dto.initData, config.TELEGRAM_BOT_TOKEN);

      let firstLogin = false;

      let user = await User.findOne({ telegramId: dto.telegramId });

      if (!user) {
        firstLogin = true;
        const newUser = new User({
          telegramId: dto.telegramId,
          username: dto.username,
          firstName: dto.firstName || '',
          lastName: dto.lastName || '',
          photoUrl: dto.photoUrl || '',
          referralCode: generateReferralCode(dto.telegramId),
        });

        user = await newUser.save();

        await questWorker.addCreateUserQuestsTask(user._id.toString());

        if (dto.code) {
          await referralWorker.addReferralTask(user._id.toString(), dto.code);
        }
      }

      user.lastLogin = new Date();
      await user.save();

      const accessToken = signToken({
        userId: user._id.toString(),
        telegramId: user.telegramId,
      });

      return res.status(HttpStatus.OK).json({
        token: {
          accessToken,
        },
        user,
        firstLogin,
      });
    } catch (error: any) {
      logger.error(error.message);
      next(error);
    }
  }
}

export default new AuthController();
