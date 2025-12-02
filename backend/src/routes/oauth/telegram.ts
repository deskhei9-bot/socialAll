import express from 'express';
import axios from 'axios';
import { pool } from '../../lib/database';

const router = express.Router();

/**
 * POST /api/oauth/telegram
 * Setup Telegram bot token and channel/group
 */
router.post('/', async (req: any, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { bot_token, chat_id } = req.body;

  if (!bot_token || !chat_id) {
    return res.status(400).json({ error: 'Bot token and chat ID are required' });
  }

  try {
    // Validate bot token by getting bot info
    const botInfoResponse = await axios.get(`https://api.telegram.org/bot${bot_token}/getMe`);
    
    if (!botInfoResponse.data.ok) {
      return res.status(400).json({ error: 'Invalid bot token' });
    }

    const botInfo = botInfoResponse.data.result;
    const botUsername = botInfo.username;
    const botId = botInfo.id;

    // Validate chat access
    const chatInfoResponse = await axios.get(`https://api.telegram.org/bot${bot_token}/getChat`, {
      params: { chat_id },
    });

    if (!chatInfoResponse.data.ok) {
      return res.status(400).json({ error: 'Cannot access chat. Make sure bot is admin in the channel/group.' });
    }

    const chatInfo = chatInfoResponse.data.result;
    const chatTitle = chatInfo.title || chatInfo.first_name || 'Telegram Chat';
    const chatType = chatInfo.type; // 'channel', 'group', 'supergroup', 'private'

    // Check if already connected
    const existingChannel = await pool.query(
      'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 AND channel_id = $3',
      [userId, 'telegram', chat_id]
    );

    if (existingChannel.rows.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE connected_channels 
         SET access_token = $1, 
             channel_name = $2, 
             is_active = true,
             metadata = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          bot_token, // Telegram bot token is stored as-is (not encrypted)
          chatTitle,
          JSON.stringify({
            bot_id: botId,
            bot_username: botUsername,
            chat_type: chatType,
          }),
          existingChannel.rows[0].id,
        ]
      );

      return res.json({
        success: true,
        message: 'Telegram channel updated successfully',
        channel: {
          id: existingChannel.rows[0].id,
          name: chatTitle,
          bot_username: botUsername,
        },
      });
    } else {
      // Insert new
      const result = await pool.query(
        `INSERT INTO connected_channels 
         (user_id, platform, channel_id, channel_name, access_token, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          userId,
          'telegram',
          chat_id,
          chatTitle,
          bot_token, // Telegram bot token is stored as-is (not encrypted)
          JSON.stringify({
            bot_id: botId,
            bot_username: botUsername,
            chat_type: chatType,
          }),
        ]
      );

      console.log(`✅ Telegram channel connected: ${chatTitle} (@${botUsername})`);

      return res.json({
        success: true,
        message: 'Telegram channel connected successfully',
        channel: {
          id: result.rows[0].id,
          name: chatTitle,
          bot_username: botUsername,
        },
      });
    }

  } catch (error: any) {
    console.error('Telegram setup error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to connect Telegram channel',
      details: error.response?.data?.description || error.message,
    });
  }
});

/**
 * GET /api/oauth/telegram/verify
 * Verify bot token validity
 */
router.post('/verify', async (req: any, res) => {
  const { bot_token } = req.body;

  if (!bot_token) {
    return res.status(400).json({ error: 'Bot token is required' });
  }

  try {
    const response = await axios.get(`https://api.telegram.org/bot${bot_token}/getMe`);
    
    if (response.data.ok) {
      const botInfo = response.data.result;
      return res.json({
        valid: true,
        bot: {
          id: botInfo.id,
          username: botInfo.username,
          first_name: botInfo.first_name,
        },
      });
    } else {
      return res.json({ valid: false, error: 'Invalid bot token' });
    }
  } catch (error: any) {
    return res.status(400).json({
      valid: false,
      error: error.response?.data?.description || 'Failed to verify bot token',
    });
  }
});

export default router;
