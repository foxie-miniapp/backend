import { BASE_EXP, EARN_EXP_FACTOR, GROWTH_FACTOR } from '../constants';

export const expToLevel = (exp: number) => {
  const level = Math.ceil(Math.log(exp / BASE_EXP) / Math.log(GROWTH_FACTOR) + 1);
  return Math.max(1, level);
};

export const earnExp = (exp: number) => {
  const level = expToLevel(exp);
  return level * EARN_EXP_FACTOR;
};
