import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Available AI models configuration
const AI_MODELS = {
  gemini: {
    'gemini-2.0-flash': {
      name: 'Gemini 2.0 Flash',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      description: 'Fast and efficient for most tasks'
    },
    'gemini-1.5-pro': {
      name: 'Gemini 1.5 Pro',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
      description: 'Advanced reasoning and longer context'
    },
    'gemini-1.5-flash': {
      name: 'Gemini 1.5 Flash',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      description: 'Balanced speed and quality'
    }
  },
  openai: {
    'gpt-4o': {
      name: 'GPT-4o',
      model: 'gpt-4o',
      description: 'Most capable OpenAI model'
    },
    'gpt-4o-mini': {
      name: 'GPT-4o Mini',
      model: 'gpt-4o-mini',
      description: 'Fast and cost-effective'
    },
    'gpt-4-turbo': {
      name: 'GPT-4 Turbo',
      model: 'gpt-4-turbo',
      description: 'Enhanced GPT-4 with better performance'
    }
  }
};

// Get available AI providers and models
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const providers: any = {};
    
    if (process.env.GEMINI_API_KEY) {
      providers.gemini = {
        name: 'Google Gemini',
        configured: true,
        models: Object.entries(AI_MODELS.gemini).map(([id, config]) => ({
          id,
          name: config.name,
          description: config.description
        }))
      };
    }
    
    if (process.env.OPENAI_API_KEY) {
      providers.openai = {
        name: 'OpenAI',
        configured: true,
        models: Object.entries(AI_MODELS.openai).map(([id, config]) => ({
          id,
          name: config.name,
          description: config.description
        }))
      };
    }

    res.json({ 
      providers,
      hasAnyProvider: Object.keys(providers).length > 0
    });
  } catch (error: any) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to get AI providers' });
  }
});

// Generate caption using AI
router.post('/generate-caption', async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      platforms, 
      tone = 'engaging', 
      description,
      provider = 'auto', // 'gemini', 'openai', or 'auto'
      model, // specific model ID
      language = 'en',
      maxLength
    } = req.body;

    // Determine which provider to use
    let useProvider = provider;
    if (provider === 'auto') {
      if (process.env.GEMINI_API_KEY) {
        useProvider = 'gemini';
      } else if (process.env.OPENAI_API_KEY) {
        useProvider = 'openai';
      }
    }

    if (useProvider === 'gemini' && !process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }
    if (useProvider === 'openai' && !process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'No AI API key configured' });
    }

    const platformList = platforms?.join(' and ') || 'social media';
    const lengthInstruction = maxLength ? `Keep it under ${maxLength} characters.` : 'Keep it concise.';
    const languageInstruction = language !== 'en' ? `Write the caption in ${language}.` : '';

    const prompt = `Generate a social media caption for the following:
Title: ${title}
${description ? `Description: ${description}` : ''}
Platforms: ${platformList}
Tone: ${tone}

Requirements:
- ${lengthInstruction}
- Make it ${tone} and authentic
- Make it suitable for ${platformList}
- Include a compelling call to action
- Do NOT include hashtags (they will be added separately)
- Do NOT include emojis unless tone requires it
${languageInstruction}

Return ONLY the caption text, nothing else.`;

    let caption = '';
    let usedModel = '';

    if (useProvider === 'gemini') {
      const selectedModel = model || 'gemini-2.0-flash';
      const modelConfig = AI_MODELS.gemini[selectedModel as keyof typeof AI_MODELS.gemini];
      const endpoint = modelConfig?.endpoint || AI_MODELS.gemini['gemini-2.0-flash'].endpoint;
      
      console.log(`[AI] Using Gemini model: ${selectedModel}`);
      
      const response = await axios.post(
        `${endpoint}?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: tone === 'professional' ? 0.3 : 0.7,
            maxOutputTokens: 1024,
          }
        }
      );
      caption = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      usedModel = selectedModel;
    } else if (useProvider === 'openai') {
      const selectedModel = model || 'gpt-4o-mini';
      const modelConfig = AI_MODELS.openai[selectedModel as keyof typeof AI_MODELS.openai];
      const modelId = modelConfig?.model || 'gpt-4o-mini';
      
      console.log(`[AI] Using OpenAI model: ${modelId}`);
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: modelId,
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional social media content creator who writes engaging, platform-optimized captions.' 
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1024,
          temperature: tone === 'professional' ? 0.3 : 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      caption = response.data.choices?.[0]?.message?.content || '';
      usedModel = modelId;
    }

    console.log(`[AI] Caption generated using ${usedModel}: ${caption.substring(0, 50)}...`);

    res.json({ 
      caption: caption.trim(),
      provider: useProvider,
      model: usedModel
    });
  } catch (error: any) {
    console.error('[AI] Caption generation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate caption',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Suggest hashtags using AI
router.post('/suggest-hashtags', async (req: Request, res: Response) => {
  try {
    const { 
      content, 
      platforms, 
      count = 10,
      provider = 'auto',
      model
    } = req.body;

    let useProvider = provider;
    if (provider === 'auto') {
      if (process.env.GEMINI_API_KEY) {
        useProvider = 'gemini';
      } else if (process.env.OPENAI_API_KEY) {
        useProvider = 'openai';
      }
    }

    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'No AI API key configured' });
    }

    const prompt = `Suggest ${count} relevant hashtags for this social media post:

Content: ${content}
Platforms: ${platforms?.join(', ') || 'general'}

Requirements:
- Mix of popular and niche hashtags for better reach
- Highly relevant to the content
- Suitable for ${platforms?.join(' and ') || 'social media'}
- Return as JSON array of strings without # symbol
- Order by relevance (most relevant first)

Example output: ["travel", "adventure", "wanderlust"]

Return ONLY the JSON array, nothing else.`;

    let hashtags: string[] = [];

    if (useProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      const selectedModel = model || 'gemini-2.0-flash';
      const modelConfig = AI_MODELS.gemini[selectedModel as keyof typeof AI_MODELS.gemini];
      const endpoint = modelConfig?.endpoint || AI_MODELS.gemini['gemini-2.0-flash'].endpoint;
      
      const response = await axios.post(
        `${endpoint}?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 512,
          }
        }
      );
      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      try {
        hashtags = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]');
      } catch {
        hashtags = text.match(/#?\w+/g)?.map((h: string) => h.replace('#', '')) || [];
      }
    } else if (useProvider === 'openai' && process.env.OPENAI_API_KEY) {
      const selectedModel = model || 'gpt-4o-mini';
      const modelConfig = AI_MODELS.openai[selectedModel as keyof typeof AI_MODELS.openai];
      const modelId = modelConfig?.model || 'gpt-4o-mini';
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: modelId,
          messages: [
            { role: 'system', content: 'You are a social media hashtag expert. Return only valid JSON array.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 256,
          temperature: 0.5,
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
    console.error('[AI] Hashtag suggestion error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to suggest hashtags' });
  }
});

// Improve/rewrite caption
router.post('/improve-caption', async (req: Request, res: Response) => {
  try {
    const { 
      caption, 
      instruction, // e.g., "make it shorter", "make it more professional"
      platforms,
      provider = 'auto',
      model
    } = req.body;

    let useProvider = provider;
    if (provider === 'auto') {
      if (process.env.GEMINI_API_KEY) {
        useProvider = 'gemini';
      } else if (process.env.OPENAI_API_KEY) {
        useProvider = 'openai';
      }
    }

    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'No AI API key configured' });
    }

    const prompt = `Improve this social media caption based on the instruction:

Original Caption: ${caption}
Instruction: ${instruction}
Platforms: ${platforms?.join(', ') || 'general'}

Return ONLY the improved caption text, nothing else.`;

    let improvedCaption = '';

    if (useProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      const selectedModel = model || 'gemini-2.0-flash';
      const modelConfig = AI_MODELS.gemini[selectedModel as keyof typeof AI_MODELS.gemini];
      const endpoint = modelConfig?.endpoint || AI_MODELS.gemini['gemini-2.0-flash'].endpoint;
      
      const response = await axios.post(
        `${endpoint}?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );
      improvedCaption = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (useProvider === 'openai' && process.env.OPENAI_API_KEY) {
      const selectedModel = model || 'gpt-4o-mini';
      const modelConfig = AI_MODELS.openai[selectedModel as keyof typeof AI_MODELS.openai];
      const modelId = modelConfig?.model || 'gpt-4o-mini';
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: modelId,
          messages: [
            { role: 'system', content: 'You are a social media content editor.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      improvedCaption = response.data.choices?.[0]?.message?.content || '';
    }

    res.json({ caption: improvedCaption.trim() });
  } catch (error: any) {
    console.error('[AI] Caption improvement error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to improve caption' });
  }
});

// Test API key
router.post('/test-key', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey } = req.body;

    if (provider === 'gemini') {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
          model: 'gpt-4o-mini',
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
    console.error('[AI] API key test error:', error.response?.data || error);
    res.json({ valid: false, message: error.response?.data?.error?.message || 'Invalid API key' });
  }
});

// Test configured provider connection
router.post('/test-provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.body;

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ success: false, error: 'Gemini API key not configured' });
      }
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: 'Say "connected" in one word.' }] }],
        }
      );
      
      if (response.data.candidates) {
        return res.json({ success: true });
      }
    } else if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        return res.json({ success: false, error: 'OpenAI API key not configured' });
      }
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say "connected"' }],
          max_tokens: 10,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.choices) {
        return res.json({ success: true });
      }
    }

    res.json({ success: false, error: 'Unknown provider' });
  } catch (error: any) {
    console.error('[AI] Provider test error:', error.response?.data || error);
    res.json({ success: false, error: error.response?.data?.error?.message || 'Connection failed' });
  }
});

// Generate caption template with platform policy compliance
router.post('/generate-template', async (req: Request, res: Response) => {
  try {
    const { 
      topic,
      tone = 'engaging',
      category,
      platforms = ['general'],
      provider = 'auto',
      model
    } = req.body;

    let useProvider = provider;
    if (provider === 'auto') {
      if (process.env.GEMINI_API_KEY) {
        useProvider = 'gemini';
      } else if (process.env.OPENAI_API_KEY) {
        useProvider = 'openai';
      }
    }

    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'No AI API key configured' });
    }

    const platformPolicies = `
CRITICAL - Follow ALL Social Media Platform Policies:

Facebook/Meta:
- No misleading content, clickbait, or sensationalized language
- No hate speech, discrimination, or harassment
- No false health claims or misinformation
- No adult content or excessive violence references
- Respect intellectual property rights

Instagram:
- No spam or artificially collected likes/followers mentions
- No false advertising or deceptive practices
- No content promoting dangerous activities
- Authentic and transparent content only
- No excessive use of hashtags in caption body

YouTube:
- No misleading metadata or thumbnails references
- No content promoting violence or dangerous activities
- No harassment or cyberbullying
- Family-friendly by default unless specified
- Respect copyright and fair use

TikTok:
- No dangerous challenges or harmful activities
- No harassment, hate speech, or bullying
- No misleading information or scams
- Age-appropriate content
- No promotion of illegal activities

Twitter/X:
- No abusive behavior or harassment
- No misleading information
- No spam or platform manipulation
- Respect others' privacy
- No promotion of violence

LinkedIn:
- Professional tone required
- No spam or irrelevant content
- No false information about career/business
- No harassment or discrimination
- Authentic professional representation

Pinterest:
- No spam or misleading pins
- No adult content
- Respect intellectual property
- No harmful misinformation
- Authentic and helpful content
`;

    const prompt = `Generate a reusable caption template for the following:

Topic/Theme: ${topic}
Category: ${category || 'General'}
Tone: ${tone}
Target Platforms: ${platforms.join(', ')}

${platformPolicies}

Requirements:
1. Create a versatile template that can be reused with different products/content
2. Use placeholders like {title}, {product}, {brand}, {link} where appropriate
3. Make it ${tone} and authentic
4. Ensure it's suitable for ALL selected platforms
5. Follow ALL platform community guidelines and advertising policies
6. NO misleading claims, clickbait, or sensationalized language
7. Include appropriate call-to-action
8. Generate 5-8 relevant, policy-compliant hashtags

Return ONLY valid JSON in this exact format:
{
  "name": "Short template name",
  "content": "The caption template with {placeholders}",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}`;

    let result: { name: string; content: string; hashtags: string[] } = {
      name: `${topic} Template`,
      content: '',
      hashtags: []
    };

    if (useProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      const selectedModel = model || 'gemini-2.0-flash';
      const modelConfig = AI_MODELS.gemini[selectedModel as keyof typeof AI_MODELS.gemini];
      const endpoint = modelConfig?.endpoint || AI_MODELS.gemini['gemini-2.0-flash'].endpoint;
      
      const response = await axios.post(
        `${endpoint}?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        }
      );
      
      const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('[AI] Failed to parse Gemini response:', e);
      }
    } else if (useProvider === 'openai' && process.env.OPENAI_API_KEY) {
      const selectedModel = model || 'gpt-4o-mini';
      const modelConfig = AI_MODELS.openai[selectedModel as keyof typeof AI_MODELS.openai];
      const modelId = modelConfig?.model || 'gpt-4o-mini';
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: modelId,
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional social media content strategist who creates policy-compliant templates. Always return valid JSON.' 
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const text = response.data.choices?.[0]?.message?.content || '';
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('[AI] Failed to parse OpenAI response:', e);
      }
    }

    console.log(`[AI] Template generated for topic: ${topic}`);

    res.json(result);
  } catch (error: any) {
    console.error('[AI] Template generation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate template',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Get trending hashtags by platform and category
router.post('/trending-hashtags', async (req: Request, res: Response) => {
  try {
    const { category = 'general', platform = 'all', platforms = [] } = req.body;

    // Determine which provider to use
    let useProvider = 'gemini';
    if (!process.env.GEMINI_API_KEY && process.env.OPENAI_API_KEY) {
      useProvider = 'openai';
    }

    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        error: 'No AI provider configured. Please set GEMINI_API_KEY or OPENAI_API_KEY.' 
      });
    }

    const platformContext = platform !== 'all' ? platform : (platforms.length > 0 ? platforms.join(', ') : 'all social media platforms');
    
    const prompt = `Generate 15 trending and popular hashtags for ${platformContext} in the "${category}" category.

PLATFORM-SPECIFIC GUIDELINES:
- Instagram: Mix of popular and niche hashtags, avoid banned hashtags
- TikTok: Focus on trending sounds and challenges related hashtags
- Twitter/X: Short, punchy hashtags, trending topics
- YouTube: Searchable keywords as hashtags
- LinkedIn: Professional, industry-specific hashtags
- Pinterest: Descriptive, searchable terms
- Facebook: Broad reach hashtags, community focused

REQUIREMENTS:
1. Return ONLY current, trending hashtags that are actively used
2. Mix high-volume (millions of posts) and medium-volume hashtags for best reach
3. Ensure all hashtags comply with platform policies
4. No offensive, banned, or shadowbanned hashtags
5. Format: Return as JSON array of strings without # symbol

Example response format:
{"hashtags": ["trending", "viral", "fyp", "explore", "instagood"]}

Category: ${category}
Platform: ${platformContext}

Return ONLY valid JSON with hashtags array.`;

    let hashtags: string[] = [];

    if (useProvider === 'gemini') {
      const modelConfig = AI_MODELS.gemini['gemini-2.0-flash'];
      const response = await axios.post(
        `${modelConfig.endpoint}?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
          }
        }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      try {
        const jsonMatch = text.match(/\{[\s\S]*"hashtags"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          hashtags = parsed.hashtags || [];
        }
      } catch (e) {
        console.error('[AI] Failed to parse Gemini trending response:', e);
        // Fallback: extract hashtags from text
        const hashtagMatches = text.match(/["']([a-zA-Z0-9_]+)["']/g);
        if (hashtagMatches) {
          hashtags = hashtagMatches.map((h: string) => h.replace(/["']/g, '')).slice(0, 15);
        }
      }
    } else {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a social media expert. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const text = response.data?.choices?.[0]?.message?.content || '';
      try {
        const jsonMatch = text.match(/\{[\s\S]*"hashtags"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          hashtags = parsed.hashtags || [];
        }
      } catch (e) {
        console.error('[AI] Failed to parse OpenAI trending response:', e);
      }
    }

    // Clean hashtags - remove # if present and filter empty
    hashtags = hashtags
      .map((h: string) => h.replace(/^#/, '').trim())
      .filter((h: string) => h.length > 0)
      .slice(0, 15);

    console.log(`[AI] Generated ${hashtags.length} trending hashtags for ${category}/${platform}`);

    res.json({ hashtags });
  } catch (error: any) {
    console.error('[AI] Trending hashtags error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch trending hashtags',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

export default router;
