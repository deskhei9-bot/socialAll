import { Telegraf } from 'telegraf';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

/**
 * Telegram Bot API Service
 */
export class TelegramService {
  /**
   * Send text message to channel or group
   */
  static async sendMessage(
    botToken: string,
    chatId: string,
    text: string,
    options: {
      parseMode?: 'Markdown' | 'HTML';
      disableWebPagePreview?: boolean;
      disableNotification?: boolean;
    } = {}
  ): Promise<{ messageId: number }> {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          chat_id: chatId,
          text,
          parse_mode: options.parseMode,
          disable_web_page_preview: options.disableWebPagePreview,
          disable_notification: options.disableNotification,
        }
      );

      return {
        messageId: response.data.result.message_id,
      };
    } catch (error: any) {
      throw new Error(`Telegram Send Message Error: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Send photo to channel or group
   */
  static async sendPhoto(
    botToken: string,
    chatId: string,
    photoPath: string,
    caption?: string,
    options: {
      parseMode?: 'Markdown' | 'HTML';
      disableNotification?: boolean;
    } = {}
  ): Promise<{ messageId: number }> {
    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', fs.createReadStream(photoPath));

      if (caption) {
        formData.append('caption', caption);
      }

      if (options.parseMode) {
        formData.append('parse_mode', options.parseMode);
      }

      if (options.disableNotification) {
        formData.append('disable_notification', 'true');
      }

      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      return {
        messageId: response.data.result.message_id,
      };
    } catch (error: any) {
      throw new Error(`Telegram Send Photo Error: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Send video to channel or group
   */
  static async sendVideo(
    botToken: string,
    chatId: string,
    videoPath: string,
    caption?: string,
    options: {
      parseMode?: 'Markdown' | 'HTML';
      disableNotification?: boolean;
      duration?: number;
      width?: number;
      height?: number;
      supportsStreaming?: boolean;
    } = {}
  ): Promise<{ messageId: number }> {
    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('video', fs.createReadStream(videoPath));

      if (caption) {
        formData.append('caption', caption);
      }

      if (options.parseMode) {
        formData.append('parse_mode', options.parseMode);
      }

      if (options.disableNotification) {
        formData.append('disable_notification', 'true');
      }

      if (options.duration) {
        formData.append('duration', options.duration.toString());
      }

      if (options.width && options.height) {
        formData.append('width', options.width.toString());
        formData.append('height', options.height.toString());
      }

      if (options.supportsStreaming) {
        formData.append('supports_streaming', 'true');
      }

      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendVideo`,
        formData,
        {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      return {
        messageId: response.data.result.message_id,
      };
    } catch (error: any) {
      throw new Error(`Telegram Send Video Error: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Send document (file) to channel or group
   */
  static async sendDocument(
    botToken: string,
    chatId: string,
    documentPath: string,
    caption?: string,
    options: {
      parseMode?: 'Markdown' | 'HTML';
      disableNotification?: boolean;
    } = {}
  ): Promise<{ messageId: number }> {
    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', fs.createReadStream(documentPath));

      if (caption) {
        formData.append('caption', caption);
      }

      if (options.parseMode) {
        formData.append('parse_mode', options.parseMode);
      }

      if (options.disableNotification) {
        formData.append('disable_notification', 'true');
      }

      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendDocument`,
        formData,
        {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      return {
        messageId: response.data.result.message_id,
      };
    } catch (error: any) {
      throw new Error(`Telegram Send Document Error: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Send media group (album of photos/videos)
   */
  static async sendMediaGroup(
    botToken: string,
    chatId: string,
    media: Array<{
      type: 'photo' | 'video';
      path: string;
      caption?: string;
    }>,
    options: {
      disableNotification?: boolean;
    } = {}
  ): Promise<{ messageIds: number[] }> {
    try {
      const formData = new FormData();
      formData.append('chat_id', chatId);

      const mediaArray = media.map((item, index) => {
        const attachName = `attach://file${index}`;
        formData.append(`file${index}`, fs.createReadStream(item.path));

        return {
          type: item.type,
          media: attachName,
          caption: item.caption || '',
        };
      });

      formData.append('media', JSON.stringify(mediaArray));

      if (options.disableNotification) {
        formData.append('disable_notification', 'true');
      }

      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMediaGroup`,
        formData,
        {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      return {
        messageIds: response.data.result.map((msg: any) => msg.message_id),
      };
    } catch (error: any) {
      throw new Error(`Telegram Send Media Group Error: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Get channel info
   */
  static async getChat(
    botToken: string,
    chatId: string
  ): Promise<{
    id: number;
    title: string;
    type: string;
    description?: string;
    memberCount?: number;
  }> {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/getChat`,
        {
          chat_id: chatId,
        }
      );

      const chat = response.data.result;

      // Get member count if it's a channel/supergroup
      let memberCount;
      try {
        const countResponse = await axios.post(
          `https://api.telegram.org/bot${botToken}/getChatMemberCount`,
          {
            chat_id: chatId,
          }
        );
        memberCount = countResponse.data.result;
      } catch (e) {
        // Ignore if can't get member count
      }

      return {
        id: chat.id,
        title: chat.title,
        type: chat.type,
        description: chat.description,
        memberCount,
      };
    } catch (error: any) {
      throw new Error(`Telegram Get Chat Error: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Delete message
   */
  static async deleteMessage(
    botToken: string,
    chatId: string,
    messageId: number
  ): Promise<void> {
    try {
      await axios.post(
        `https://api.telegram.org/bot${botToken}/deleteMessage`,
        {
          chat_id: chatId,
          message_id: messageId,
        }
      );
    } catch (error: any) {
      throw new Error(`Telegram Delete Message Error: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Pin message in channel
   */
  static async pinMessage(
    botToken: string,
    chatId: string,
    messageId: number,
    disableNotification: boolean = false
  ): Promise<void> {
    try {
      await axios.post(
        `https://api.telegram.org/bot${botToken}/pinChatMessage`,
        {
          chat_id: chatId,
          message_id: messageId,
          disable_notification: disableNotification,
        }
      );
    } catch (error: any) {
      throw new Error(`Telegram Pin Message Error: ${error.response?.data?.description || error.message}`);
    }
  }

  /**
   * Get bot info
   */
  static async getBotInfo(botToken: string): Promise<{
    id: number;
    isBot: boolean;
    firstName: string;
    username: string;
  }> {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${botToken}/getMe`
      );

      const bot = response.data.result;

      return {
        id: bot.id,
        isBot: bot.is_bot,
        firstName: bot.first_name,
        username: bot.username,
      };
    } catch (error: any) {
      throw new Error(`Telegram Get Bot Info Error: ${error.response?.data?.description || error.message}`);
    }
  }
}
