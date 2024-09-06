import * as crypto from 'crypto';

export function generateReferralCode(telegramId: string, length: number = 8): string {
  // Convert the userId to a buffer
  const userIdBuffer = Buffer.from(telegramId);

  // Create a hash of the userId
  const hash = crypto.createHash('sha256').update(userIdBuffer).digest();

  // Convert the hash to a base62 string (0-9, a-z, A-Z)
  const base62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';

  for (let i = 0; i < length; i++) {
    referralCode += base62[hash[i] % 62];
  }

  return referralCode;
}
