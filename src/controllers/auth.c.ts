import Referral from 'src/database/entities/referral.entity';
import User from 'src/database/entities/user.entity';
import { generateReferralCode } from 'src/helpers/referral.helper';
import { verifyTelegramId } from 'src/helpers/telegram.helper';
import { Validation } from 'src/shared/decorators/validation-pipe.decorator';
import { CreateCredentialsDto } from 'src/shared/dtos/auth/create-credentials.dto';
import { BadRequestException } from 'src/shared/exceptions';
import { HttpStatus } from 'src/shared/exceptions/enums/http-status.enum';
import { signToken } from 'src/utils/jwt';
import { NextFunction, Request, Response } from 'express';

import logger from '../utils/logger';

class AuthController {
  @Validation(CreateCredentialsDto)
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateCredentialsDto;
      const isValidTelegramId = await verifyTelegramId(dto.telegramId);

      if (!isValidTelegramId) {
        next(new BadRequestException({ details: [{ issue: 'Invalid telegram id' }] }));
      }

      let user = await User.findOne({ telegramId: dto.telegramId });

      if (!user) {
        const newUser = new User({
          telegramId: dto.telegramId,
          username: dto.username,
          referralCode: generateReferralCode(dto.telegramId),
        });

        user = await newUser.save();

        if (dto.code) {
          const referrer = await User.findOne({
            referralCode: dto.code,
          });

          user.referredBy = referrer?._id;
          const referral = new Referral({
            referrer: referrer?._id,
            referred: user._id,
          });

          await referral.save();
          await user.save();
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
