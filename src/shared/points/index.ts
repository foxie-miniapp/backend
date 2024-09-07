import { DAILY_REWARD_POINT_FACTOR } from '../constants';
import { expToLevel } from '../levels';

export const dailyRewardPoints = (exp: number) => {
  const level = expToLevel(exp);
  return level * DAILY_REWARD_POINT_FACTOR;
};
