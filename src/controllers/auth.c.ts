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
      // const isValidTelegramId = await verifyTelegramId(dto.telegramId);

      // if (!isValidTelegramId) {
      //   next(new BadRequestException({ details: [{ issue: 'Invalid telegram id' }] }));
      // }

      let user = await User.findOne({ telegramId: dto.telegramId });

      if (!user) {
        const newUser = new User({
          telegramId: dto.telegramId,
          username: dto.username,
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
      });
    } catch (error: any) {
      logger.error(error.message);
      next(error);
    }
  }
}

export default new AuthController();
