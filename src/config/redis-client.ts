import Redis from 'ioredis';

import { config } from './configuration';

export const redisClient = new Redis({
  port: Number(config.REDIS_PORT),
  host: String(config.REDIS_HOST),
  password: String(config.REDIS_PASSWORD),
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

export default redisClient;
