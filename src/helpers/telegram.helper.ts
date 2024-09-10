import axios from 'axios';
import * as TelegramBot from 'node-telegram-bot-api';
import { config } from 'src/config/configuration';

export async function verifyTelegramId(telegramId: string): Promise<boolean> {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getChat`, {
      params: {
        chat_id: telegramId,
      },
    });

    if (response.data && response.data.ok && response.data.result) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
}

export async function checkJoinGroupTelegram(telegramGroupId: string, telegramUserId: string) {
  const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: false });

  const chatMember = await bot.getChatMember(telegramGroupId, Number(telegramUserId));

  if (['member', 'administrator', 'creator'].includes(chatMember.status)) {
    return true;
  } else {
    return false;
  }
}
