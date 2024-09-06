import axios from 'axios';
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
