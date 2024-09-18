import { BASE_EXP, EARN_EXP_FACTOR, GROWTH_FACTOR } from '../constants';

const levelToExp = (level: number) => {
  const exactExp = BASE_EXP * Math.pow(GROWTH_FACTOR, level - 1);
  if (exactExp >= 1000000) {
    return Math.floor(exactExp / 100000) * 100000 - 1;
  } else if (exactExp >= 10000) {
    return Math.floor(exactExp / 1000) * 1000 - 1;
  } else if (exactExp >= 1000) {
    return Math.floor(exactExp / 100) * 100 - 1 - 700;
  } else {
    return Math.floor(exactExp) - 1;
  }
};

export const expToLevel = (exp: number) => {
  let level = 1;
  while (levelToExp(level) < exp) {
    level++;
  }

  return Math.max(1, level);
};

export const earnExp = (exp: number) => {
  const level = expToLevel(exp);
  return level * EARN_EXP_FACTOR;
};
