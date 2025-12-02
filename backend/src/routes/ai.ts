import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Generate caption using AI
router.post('/generate-caption', async (req: Request, res: Response) => {
  try {
    const { title, platforms, tone = 'engaging', description } = req.body;

    // Try Gemini first, then OpenAI
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'No AI API key configured' });
    }

    const prompt = `Generate a social media caption for the following:
Title: ${title}
${description ? `Description: ${description}` : ''}
Platforms: ${platforms?.join(', ') || 'general'}
Tone: ${tone}

Requirements:
- Keep it concise and ${tone}
- Make it suitable for ${platforms?.join(' and ') || 'social media'}
- Include a call to action
- Do NOT include hashtags (they will be added separately)

Return ONLY the caption text, nothing else.`;

    let caption = '';

    if (process.env.GEMINI_API_KEY) {
      // Use Gemini
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );
      caption = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (process.env.OPENAI_API_KEY) {
      // Use OpenAI
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a social media content expert.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      caption = response.data.choices?.[0]?.message?.content || '';
    }

    res.json({ caption: caption.trim() });
  } catch (error: any) {
    console.error('Caption generation error:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to generate caption' });
  }
});

// Suggest hashtags using AI
router.post('/suggest-hashtags', async (req: Request, res: Response) => {
  try {
    const { content, platforms, count = 10 } = req.body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'No AI API key configured' });
    }

    const prompt = `Suggest ${count} relevant hashtags for this social media post:

Content: ${content}
Platforms: ${platforms?.join(', ') || 'general'}

Requirements:
- Mix of popular and niche hashtags
- Relevant to the content
- Suitable for ${platforms?.join(' and ') || 'social media'}
- Return as JSON array of strings without # symbol

Example output: ["travel", "adventure", "wanderlust"]`;

    let hashtags: string[] = [];

    if (process.env.GEMINI_API_KEY) {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );
      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      try {
        hashtags = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]');
      } catch {
        hashtags = text.match(/#?\w+/g)?.map((h: string) => h.replace('#', '')) || [];
      }
    } else if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a social media hashtag expert. Return only valid JSON array.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const text = response.data.choices?.[0]?.message?.content || '[]';
      try {
        hashtags = JSON.parse(text);
      } catch {
        hashtags = text.match(/#?\w+/g)?.map((h: string) => h.replace('#', '')) || [];
      }
    }

    res.json({ hashtags: hashtags.slice(0, count) });
  } catch (error: any) {
    console.error('Hashtag suggestion error:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to suggest hashtags' });
  }
});

// Test API key
router.post('/test-key', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey } = req.body;

    if (provider === 'gemini') {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: 'Say "API key is valid" in exactly 4 words.' }] }],
        }
      );
      
      if (response.data.candidates) {
        return res.json({ valid: true, message: 'Gemini API key is valid' });
      }
    } else if (provider === 'openai') {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say "valid"' }],
          max_tokens: 10,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.choices) {
        return res.json({ valid: true, message: 'OpenAI API key is valid' });
      }
    }

    res.json({ valid: false, message: 'Unknown provider' });
  } catch (error: any) {
    console.error('API key test error:', error.response?.data || error);
    res.json({ valid: false, message: error.response?.data?.error?.message || 'Invalid API key' });
  }
});

export default router;
