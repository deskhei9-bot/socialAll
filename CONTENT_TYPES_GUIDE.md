# Content Types Guide - Social Auto Upload

## 📋 Overview

System က content types အမျိုးမျိုးကို support လုပ်ပါတယ်။ Platform တိုင်းမှာ support လုပ်တဲ့ content types တွေ မတူညီပါဘူး။

---

## 🎯 Supported Content Types by Platform

### 1️⃣ **Facebook** 
✅ **Fully Supported via API**

| Post Type | Description | Required Fields | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `text` | Text-only post | `content` | - |
| `photo` | Single photo | `content`, `media_url` (image) | - |
| `video` | Video post | `content`, `media_url` (video) | - |
| `album` | Multiple photos | `content`, `metadata.media_urls[]` | - |
| `reel` | Facebook Reel | `content`, `media_url` (video) | - |
| `link` | Link share | `content`, `metadata.link_url` | - |

**Example Request:**
```json
{
  "title": "My First Post",
  "content": "Check out this amazing photo! 📸",
  "platforms": ["facebook"],
  "post_type": "photo",
  "media_url": "https://socialautoupload.com/uploads/images/photo.jpg",
  "status": "scheduled",
  "scheduled_for": "2025-12-03T10:00:00Z"
}
```

---

### 2️⃣ **YouTube**
✅ **Fully Supported via API**

| Post Type | Description | Required Fields | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `video` | Regular video | `content` (title), `media_url` (video) | `metadata.description`, `metadata.tags[]`, `metadata.category_id`, `metadata.privacy` |
| `short` | YouTube Short | `content` (title), `media_url` (video < 60s) | `metadata.description` |

**Example Request:**
```json
{
  "title": "How to Cook Myanmar Food",
  "content": "Traditional Myanmar Cooking Tutorial",
  "platforms": ["youtube"],
  "post_type": "video",
  "media_url": "https://socialautoupload.com/uploads/videos/cooking.mp4",
  "metadata": {
    "description": "Learn how to cook authentic Myanmar dishes step by step",
    "tags": ["cooking", "myanmar", "food", "tutorial"],
    "category_id": "22",
    "privacy": "public"
  },
  "status": "scheduled",
  "scheduled_for": "2025-12-03T14:00:00Z"
}
```

---

### 3️⃣ **TikTok**
✅ **Fully Supported via API**

| Post Type | Description | Required Fields | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `video` | TikTok video | `content`, `media_url` (video) | `metadata.privacy_level`, `metadata.disable_comment`, `metadata.disable_duet`, `metadata.disable_stitch` |

**Privacy Levels:**
- `PUBLIC_TO_EVERYONE` (default)
- `MUTUAL_FOLLOW_FRIENDS`
- `SELF_ONLY`

**Example Request:**
```json
{
  "content": "Dancing to the latest trend! 💃 #dance #trending",
  "platforms": ["tiktok"],
  "post_type": "video",
  "media_url": "https://socialautoupload.com/uploads/videos/dance.mp4",
  "metadata": {
    "privacy_level": "PUBLIC_TO_EVERYONE",
    "disable_comment": false,
    "disable_duet": false,
    "disable_stitch": false
  },
  "status": "scheduled",
  "scheduled_for": "2025-12-03T18:00:00Z"
}
```

---

### 4️⃣ **Instagram**
⚠️ **Requires Facebook Page Connection**

| Post Type | Description | Required Fields | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `photo` | Single photo | `content`, `media_url` (image) | - |
| `video` | Video post | `content`, `media_url` (video) | - |
| `reel` | Instagram Reel | `content`, `media_url` (video) | - |

**Note:** Instagram channel မှာ `metadata.facebook_page_id` ရှိရမယ်။

**Example Request:**
```json
{
  "content": "Sunset vibes 🌅 #sunset #photography",
  "platforms": ["instagram"],
  "post_type": "reel",
  "media_url": "https://socialautoupload.com/uploads/videos/sunset.mp4",
  "status": "scheduled",
  "scheduled_for": "2025-12-03T19:00:00Z"
}
```

---

### 5️⃣ **Twitter / X**
⚠️ **Requires OAuth 1.0a Authentication**

| Post Type | Description | Required Fields | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `text` | Text tweet | `content` (max 280 chars) | - |
| `media` | Tweet with media | `content`, `media_url` | - |

**Note:** Channel မှာ `metadata.access_secret` ရှိရမယ်။

**Example Request:**
```json
{
  "content": "Just launched our new feature! Check it out 🚀 #ProductLaunch",
  "platforms": ["twitter"],
  "post_type": "text",
  "status": "published"
}
```

---

### 6️⃣ **Telegram**
✅ **Fully Supported via Bot API**

| Post Type | Description | Required Fields | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `message` | Text message | `content` | - |
| `photo` | Photo message | `content`, `media_url` (image) | - |
| `video` | Video message | `content`, `media_url` (video) | - |

**Example Request:**
```json
{
  "content": "Breaking news update! 📰",
  "platforms": ["telegram"],
  "post_type": "message",
  "status": "published"
}
```

---

### 7️⃣ **LinkedIn**
⚠️ **API Publishing Available**

| Post Type | Description | Required Fields | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `post` | Text post | `content` | - |
| `image` | Post with image | `content`, `media_url` (image) | - |

**Example Request:**
```json
{
  "content": "Excited to share our company's quarterly results! 📊 #Business #Growth",
  "platforms": ["linkedin"],
  "post_type": "post",
  "status": "published"
}
```

---

## 📝 How to Create Posts with Different Content Types

### Method 1: Using API Directly

**Endpoint:** `POST https://socialautoupload.com/api/posts`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Optional title",
  "content": "Your post content here",
  "platforms": ["facebook", "instagram"],
  "post_type": "photo",
  "media_url": "https://socialautoupload.com/uploads/images/photo.jpg",
  "media_type": "image",
  "status": "scheduled",
  "scheduled_for": "2025-12-03T10:00:00Z",
  "metadata": {
    "additional": "fields",
    "custom": "data"
  }
}
```

### Method 2: Using Frontend (Browser)

1. Navigate to **Create Post** page
2. Select platforms
3. Write your content
4. Upload media (if needed)
5. Choose publish option:
   - **Publish Now** - Immediate publishing
   - **Schedule** - Set date/time for auto-publishing
   - **Save as Draft** - Save for later

**Note:** Frontend မှာ post_type selector မရှိသေးပါ။ System က media type ကို automatically detect လုပ်ပါတယ်:
- Image uploaded → `post_type: "photo"`
- Video uploaded → `post_type: "video"`
- No media → `post_type: "text"`

---

## 🎬 Media File Requirements

### **Images (Photos)**
- **Supported formats:** JPG, PNG, GIF, WEBP
- **Max size:** 10 MB
- **Recommended:** 1080x1080px (square), 1080x1350px (portrait)

### **Videos**
- **Supported formats:** MP4, MOV, AVI
- **Max size:** 500 MB
- **Facebook Video:** Max 240 minutes
- **Facebook Reel:** 3-60 seconds
- **YouTube Video:** Max 15 GB (or up to 12 hours)
- **YouTube Short:** Max 60 seconds
- **TikTok:** 3-10 minutes
- **Instagram Reel:** 15-90 seconds

---

## ⏰ Scheduling Posts

### Auto-Publishing Scheduler
- **Runs every:** 60 seconds
- **Checks:** Posts with `status = 'scheduled'` and `scheduled_for <= NOW()`
- **Actions:** 
  1. Publishes to selected platforms
  2. Updates status to `'published'` or `'failed'`
  3. Saves results to `post_results` table

### Example Scheduled Post:

```bash
# Create a scheduled post via API
curl -X POST https://socialautoupload.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Good morning! ☀️",
    "platforms": ["facebook", "twitter"],
    "post_type": "text",
    "status": "scheduled",
    "scheduled_for": "2025-12-03T06:00:00Z"
  }'
```

---

## 🔍 Testing Different Content Types

### Test 1: Text Post to Multiple Platforms

```bash
curl -X POST https://socialautoupload.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Testing multi-platform posting! 🚀 #test",
    "platforms": ["facebook", "twitter", "linkedin"],
    "post_type": "text",
    "status": "published"
  }'
```

### Test 2: Photo Post to Facebook

```bash
curl -X POST https://socialautoupload.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beautiful Sunset",
    "content": "Amazing sunset at Yangon! 🌅 #Myanmar #Sunset",
    "platforms": ["facebook"],
    "post_type": "photo",
    "media_url": "https://socialautoupload.com/uploads/images/sunset.jpg",
    "media_type": "image",
    "status": "published"
  }'
```

### Test 3: YouTube Video Upload

```bash
curl -X POST https://socialautoupload.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Myanmar Travel Vlog",
    "content": "Exploring the beautiful temples of Bagan",
    "platforms": ["youtube"],
    "post_type": "video",
    "media_url": "https://socialautoupload.com/uploads/videos/travel.mp4",
    "media_type": "video",
    "metadata": {
      "description": "Join me as I explore the ancient temples of Bagan, Myanmar. A journey through history and culture.",
      "tags": ["travel", "myanmar", "bagan", "temples", "vlog"],
      "category_id": "19",
      "privacy": "public"
    },
    "status": "scheduled",
    "scheduled_for": "2025-12-03T12:00:00Z"
  }'
```

### Test 4: Facebook Reel

```bash
curl -X POST https://socialautoupload.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Quick cooking tip! 🍳 #Cooking #Tips",
    "platforms": ["facebook"],
    "post_type": "reel",
    "media_url": "https://socialautoupload.com/uploads/videos/cooking-tip.mp4",
    "media_type": "video",
    "status": "published"
  }'
```

---

## 📊 Checking Post Results

### View Post Results in Database

```sql
-- Check recent posts
SELECT id, title, content, post_type, status, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 10;

-- Check publishing results
SELECT 
  pr.platform,
  pr.status,
  pr.platform_post_id,
  pr.platform_url,
  pr.error_message,
  p.title,
  p.post_type
FROM post_results pr
JOIN posts p ON pr.post_id = p.id
ORDER BY pr.created_at DESC
LIMIT 20;
```

### View via Analytics Dashboard

1. Navigate to **Analytics** page
2. View:
   - Total posts by type
   - Success/failure rates by platform
   - Recent activity log
   - Platform-specific metrics

---

## ⚠️ Important Notes

### Platform Limitations:
- **Facebook:** Requires Page access token, not personal profile
- **Instagram:** Must be connected through Facebook Page
- **Twitter:** Requires OAuth 1.0a with access_secret
- **YouTube:** Requires OAuth 2.0 with refresh token
- **TikTok:** Requires OAuth with specific scopes

### File Upload:
- Files တွေက `/uploads/` directory မှာ သိမ်းပါတယ်
- URL format: `https://socialautoupload.com/uploads/images/filename.jpg`
- Scheduler က local file path သုံးပြီး upload လုပ်ပါတယ်

### Status Flow:
1. **draft** → Saved but not published
2. **scheduled** → Will auto-publish at scheduled_for time
3. **publishing** → Currently being published
4. **published** → Successfully published
5. **failed** → Publishing failed (check post_results for error)

---

## 🚀 Quick Reference

| Platform | Text | Photo | Video | Reel/Short | Album | Link |
|----------|------|-------|-------|------------|-------|------|
| Facebook | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| YouTube | ❌ | ❌ | ✅ | ✅ (Short) | ❌ | ❌ |
| TikTok | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Instagram | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Twitter | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Telegram | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| LinkedIn | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📞 Need Help?

If you encounter issues:
1. Check PM2 logs: `pm2 logs social-symphony-api`
2. Check database: `SELECT * FROM post_results WHERE status = 'failed' ORDER BY created_at DESC LIMIT 10;`
3. Verify channel connections: `SELECT platform, channel_name, is_active FROM connected_channels;`

---

**Last Updated:** December 2, 2025
