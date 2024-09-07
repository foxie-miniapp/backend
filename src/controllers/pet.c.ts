import User from 'src/database/entities/user.entity';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { BadRequestException } from 'src/shared/exceptions';
import { HttpStatus } from 'src/shared/exceptions/enums/http-status.enum';
import { HttpException } from 'src/shared/exceptions/http.exception';
import { CustomUserRequest } from 'src/shared/interfaces/request.interface';
import { earnExp } from 'src/shared/levels';
import logger from 'src/utils/logger';
import { NextFunction, Response } from 'express';

class PetController {
  @Auth()
  async feedPet(req: CustomUserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;

      const user = await User.findOne({ _id: userId });

      if (user.numberOfFoods < 1) {
        throw new BadRequestException({ details: [{ issue: 'Not enough food' }] });
      }

      const exp = earnExp(user.exp);

      const { acknowledged } = await User.updateOne({ _id: userId }, { $inc: { numberOfFoods: -1, exp: exp } });

      if (!acknowledged) {
        throw new HttpException([{ issue: 'Something went wrong' }], HttpStatus.INTERNAL_SERVER_ERROR, undefined);
      }

      return res.status(HttpStatus.OK).json();
    } catch (error: unknown) {
      logger.error('Error in feedPet:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  }
}

export default new PetController();
