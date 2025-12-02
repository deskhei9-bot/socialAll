# Content Types လမ်းညွှန် - Social Auto Upload

## 📋 အကျဉ်းချုပ်

System က content types အမျိုးမျိုးကို support လုပ်ပါတယ်။ Platform တစ်ခုချင်းစီမှာ support လုပ်တဲ့ content types တွေ မတူညီပါဘူး။

---

## 🎯 Platform တစ်ခုစီမှာ သုံးလို့ရတဲ့ Content Types

### 1️⃣ **Facebook** 
✅ **API ကနေ အပြည့်အဝ support လုပ်ပါတယ်**

| Post Type | ရှင်းလင်းချက် | မဖြစ်မနေ လိုအပ်တာတွေ | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `text` | စာသားသက်သက် | `content` | - |
| `photo` | ပုံတစ်ပုံ | `content`, `media_url` (ပုံ) | - |
| `video` | ဗီဒီယို | `content`, `media_url` (ဗီဒီယို) | - |
| `album` | ပုံများစွာ | `content`, `metadata.media_urls[]` | - |
| `reel` | Facebook Reel | `content`, `media_url` (ဗီဒီယို) | - |
| `link` | Link share | `content`, `metadata.link_url` | - |

**Example Request:**
```json
{
  "title": "ကျွန်တော့်ရဲ့ ပထမဆုံး post",
  "content": "အရမ်းလှတဲ့ ပုံကို ကြည့်ပါ! 📸",
  "platforms": ["facebook"],
  "post_type": "photo",
  "media_url": "https://socialautoupload.com/uploads/images/photo.jpg",
  "status": "scheduled",
  "scheduled_for": "2025-12-03T10:00:00Z"
}
```

---

### 2️⃣ **YouTube**
✅ **API ကနေ အပြည့်အဝ support လုပ်ပါတယ်**

| Post Type | ရှင်းလင်းချက် | မဖြစ်မနေ လိုအပ်တာတွေ | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `video` | ပုံမှန် video | `content` (ခေါင်းစဉ်), `media_url` (ဗီဒီယို) | `metadata.description`, `metadata.tags[]`, `metadata.category_id`, `metadata.privacy` |
| `short` | YouTube Short | `content` (ခေါင်းစဉ်), `media_url` (60s အောက်) | `metadata.description` |

**Privacy Options:**
- `public` - လူတိုင်း ကြည့်လို့ရမယ်
- `private` - ကိုယ်တစ်ယောက်တည်း
- `unlisted` - Link သိရင် ကြည့်လို့ရမယ်

**Example Request:**
```json
{
  "title": "မြန်မာ အစားအစာ ချက်နည်း",
  "content": "ရိုးရာ မြန်မာ အစားအစာ ချက်နည်း သင်ခန်းစာ",
  "platforms": ["youtube"],
  "post_type": "video",
  "media_url": "https://socialautoupload.com/uploads/videos/cooking.mp4",
  "metadata": {
    "description": "မြန်မာ ရိုးရာ အစားအစာတွေကို အဆင့်ဆင့် ချက်နည်း လေ့လာပါ",
    "tags": ["cooking", "myanmar", "food", "tutorial", "မြန်မာ"],
    "category_id": "22",
    "privacy": "public"
  },
  "status": "scheduled",
  "scheduled_for": "2025-12-03T14:00:00Z"
}
```

---

### 3️⃣ **TikTok**
✅ **API ကနေ အပြည့်အဝ support လုပ်ပါတယ်**

| Post Type | ရှင်းလင်းချက် | မဖြစ်မနေ လိုအပ်တာတွေ | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `video` | TikTok ဗီဒီယို | `content`, `media_url` (ဗီဒီယို) | `metadata.privacy_level`, `metadata.disable_comment`, `metadata.disable_duet`, `metadata.disable_stitch` |

**Privacy Levels:**
- `PUBLIC_TO_EVERYONE` (default) - လူတိုင်းကြည့်လို့ရမယ်
- `MUTUAL_FOLLOW_FRIENDS` - friend တွေပဲ
- `SELF_ONLY` - ကိုယ်တစ်ယောက်တည်း

**Example Request:**
```json
{
  "content": "နောက်ဆုံး trend နဲ့ ကခုန်ခြင်း! 💃 #dance #trending",
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
⚠️ **Facebook Page နဲ့ ချိတ်ဆက်ထားရမယ်**

| Post Type | ရှင်းလင်းချက် | မဖြစ်မနေ လိုအပ်တာတွေ | Optional Fields |
|-----------|-------------|-----------------|-----------------|
| `photo` | ပုံတစ်ပုံ | `content`, `media_url` (ပုံ) | - |
| `video` | ဗီဒီယို post | `content`, `media_url` (ဗီဒီယို) | - |
| `reel` | Instagram Reel | `content`, `media_url` (ဗီဒီယို) | - |

**မှတ်ချက်:** Instagram channel မှာ `metadata.facebook_page_id` ရှိရမယ်။

---

### 5️⃣ **Twitter / X**
⚠️ **OAuth 1.0a Authentication လိုအပ်ပါတယ်**

| Post Type | ရှင်းလင်းချက် | မဖြစ်မနေ လိုအပ်တာတွေ |
|-----------|-------------|-----------------|
| `text` | စာသား tweet | `content` (280 chars အတွင်း) |
| `media` | Media ပါတဲ့ tweet | `content`, `media_url` |

---

### 6️⃣ **Telegram**
✅ **Bot API ကနေ အပြည့်အဝ support လုပ်ပါတယ်**

| Post Type | ရှင်းလင်းချက် | မဖြစ်မနေ လိုအပ်တာတွေ |
|-----------|-------------|-----------------|
| `message` | စာသား message | `content` |
| `photo` | ပုံ message | `content`, `media_url` (ပုံ) |
| `video` | ဗီဒီယို message | `content`, `media_url` (ဗီဒီယို) |

---

### 7️⃣ **LinkedIn**
⚠️ **API Publishing ရရှိနိုင်ပါတယ်**

| Post Type | ရှင်းလင်းချက် | မဖြစ်မနေ လိုအပ်တာတွေ |
|-----------|-------------|-----------------|
| `post` | စာသား post | `content` |
| `image` | ပုံပါတဲ့ post | `content`, `media_url` (ပုံ) |

---

## 📝 မတူညီတဲ့ Content Types တွေကို ဘယ်လို တင်မလဲ

### နည်းလမ်း ၁: API ကို တိုက်ရိုက် သုံးခြင်း

**Endpoint:** `POST https://socialautoupload.com/api/posts`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body Example - Facebook Photo:**
```json
{
  "title": "လှပတဲ့ နေဝင်ချိန်",
  "content": "ရန်ကုန်မှာ အရမ်းလှတဲ့ နေဝင်ချိန်! 🌅 #Myanmar #Sunset",
  "platforms": ["facebook"],
  "post_type": "photo",
  "media_url": "https://socialautoupload.com/uploads/images/sunset.jpg",
  "media_type": "image",
  "status": "scheduled",
  "scheduled_for": "2025-12-03T18:00:00Z"
}
```

**Request Body Example - YouTube Video:**
```json
{
  "title": "မြန်မာ ခရီးသွား Vlog",
  "content": "ပုဂံ ဘုရားတွေကို လေ့လာခြင်း",
  "platforms": ["youtube"],
  "post_type": "video",
  "media_url": "https://socialautoupload.com/uploads/videos/travel.mp4",
  "media_type": "video",
  "metadata": {
    "description": "မြန်မာနိုင်ငံ ပုဂံမြို့ ရှေးဟောင်း ဘုရားတွေကို လေ့လာရင်း ခရီးသွားခြင်း",
    "tags": ["travel", "myanmar", "bagan", "temples", "vlog", "ခရီးသွား", "မြန်မာ"],
    "category_id": "19",
    "privacy": "public"
  },
  "status": "scheduled",
  "scheduled_for": "2025-12-03T12:00:00Z"
}
```

**Request Body Example - Facebook Reel:**
```json
{
  "content": "ချက်ပြုတ်ရေး အကြံပြုချက်! 🍳 #Cooking #Tips",
  "platforms": ["facebook"],
  "post_type": "reel",
  "media_url": "https://socialautoupload.com/uploads/videos/cooking-tip.mp4",
  "media_type": "video",
  "status": "published"
}
```

**Request Body Example - Facebook Album:**
```json
{
  "title": "ခရီးသွား အမှတ်တရများ",
  "content": "ပုဂံ ခရီးစဉ် ပုံများ 📸",
  "platforms": ["facebook"],
  "post_type": "album",
  "metadata": {
    "media_urls": [
      "https://socialautoupload.com/uploads/images/photo1.jpg",
      "https://socialautoupload.com/uploads/images/photo2.jpg",
      "https://socialautoupload.com/uploads/images/photo3.jpg",
      "https://socialautoupload.com/uploads/images/photo4.jpg"
    ]
  },
  "status": "published"
}
```

---

### နည်းလမ်း ၂: Frontend (Browser) ကနေ သုံးခြင်း

1. **Create Post** page ကို သွားပါ
2. Platform တွေ ရွေးပါ
3. Content ရေးပါ
4. Media upload လုပ်ပါ (လိုအပ်ရင်)
5. Publish option ရွေးပါ:
   - **Publish Now** - ချက်ချင်း တင်မယ်
   - **Schedule** - အချိန် set လုပ်ပြီး auto-publish လုပ်မယ်
   - **Save as Draft** - နောက်မှ တင်ဖို့ သိမ်းမယ်

**မှတ်ချက်:** 
- Frontend မှာ post_type selector မရှိသေးပါ
- System က media type ကို automatically detect လုပ်ပါတယ်:
  - ပုံ upload လုပ်ရင် → `post_type: "photo"`
  - ဗီဒီယို upload လုပ်ရင် → `post_type: "video"`
  - Media မရှိရင် → `post_type: "text"`

---

## 🎬 Media File လိုအပ်ချက်များ

### **ပုံများ (Photos)**
- **Format:** JPG, PNG, GIF, WEBP
- **Max size:** 10 MB
- **အကြံပြုတာ:** 1080x1080px (square), 1080x1350px (portrait)

### **ဗီဒီယိုများ (Videos)**
- **Format:** MP4, MOV, AVI
- **Max size:** 500 MB
- **Facebook Video:** Max 240 မိနစ်
- **Facebook Reel:** 3-60 စက္ကန့်
- **YouTube Video:** Max 15 GB (သို့မဟုတ် 12 နာရီ)
- **YouTube Short:** Max 60 စက္ကန့်
- **TikTok:** 3-10 မိနစ်
- **Instagram Reel:** 15-90 စက္ကန့်

---

## ⏰ Posts တွေကို အချိန်ကြိုတင်စီစဉ်ခြင်း

### Auto-Publishing Scheduler
- **Run frequency:** 60 စက္ကန့် တစ်ခါ
- **Check:** `status = 'scheduled'` နဲ့ `scheduled_for <= NOW()` ဖြစ်တဲ့ posts
- **လုပ်ဆောင်ချက်များ:** 
  1. ရွေးထားတဲ့ platforms တွေကို publish လုပ်မယ်
  2. Status ကို `'published'` သို့မဟုတ် `'failed'` ပြောင်းမယ်
  3. Results တွေကို `post_results` table မှာ သိမ်းမယ်

---

## 🔍 Content Types များကို Test လုပ်ခြင်း

### Test 1: Platform များစွာသို့ စာသား Post

```bash
curl -X POST https://socialautoupload.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Multi-platform posting test လုပ်နေပါတယ်! 🚀 #test",
    "platforms": ["facebook", "twitter", "linkedin"],
    "post_type": "text",
    "status": "published"
  }'
```

### Test 2: Facebook သို့ ပုံ Post

```bash
curl -X POST https://socialautoupload.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "လှပတဲ့ နေဝင်ချိန်",
    "content": "ရန်ကုန်မှာ အရမ်းလှတဲ့ နေဝင်ချိန်! 🌅 #Myanmar #Sunset",
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
    "title": "မြန်မာ ခရီးသွား Vlog",
    "content": "ပုဂံ ဘုရားတွေကို လေ့လာခြင်း",
    "platforms": ["youtube"],
    "post_type": "video",
    "media_url": "https://socialautoupload.com/uploads/videos/travel.mp4",
    "media_type": "video",
    "metadata": {
      "description": "မြန်မာနိုင်ငံ ပုဂံမြို့ ရှေးဟောင်း ဘုရားတွေကို လေ့လာရင်း ခရီးသွားခြင်း",
      "tags": ["travel", "myanmar", "bagan", "temples", "vlog"],
      "category_id": "19",
      "privacy": "public"
    },
    "status": "scheduled",
    "scheduled_for": "2025-12-03T12:00:00Z"
  }'
```

---

## 📊 Post Results စစ်ဆေးခြင်း

### Database မှာ ကြည့်ရန်

```sql
-- လတ်တလော posts များ
SELECT id, title, content, post_type, status, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 10;

-- Publishing results များ
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

### Analytics Dashboard မှာ ကြည့်ရန်

1. **Analytics** page သွားပါ
2. ကြည့်နိုင်တာများ:
   - Post type အလိုက် စုစုပေါင်း posts
   - Platform အလိုက် အောင်မြင်မှု/မအောင်မြင်မှု နှုန်း
   - လတ်တလော activity log
   - Platform-specific metrics

---

## ⚠️ အရေးကြီးတဲ့ မှတ်ချက်များ

### Platform ကန့်သတ်ချက်များ:
- **Facebook:** Page access token လိုအပ်ပါတယ် (personal profile မဟုတ်ပါ)
- **Instagram:** Facebook Page နဲ့ ချိတ်ဆက်ရမယ်
- **Twitter:** OAuth 1.0a နဲ့ access_secret လိုအပ်ပါတယ်
- **YouTube:** OAuth 2.0 နဲ့ refresh token လိုအပ်ပါတယ်
- **TikTok:** OAuth နဲ့ specific scopes လိုအပ်ပါတယ်

### File Upload:
- File တွေက `/uploads/` directory မှာ သိမ်းပါတယ်
- URL format: `https://socialautoupload.com/uploads/images/filename.jpg`
- Scheduler က local file path သုံးပြီး upload လုပ်ပါတယ်

### Status Flow:
1. **draft** → သိမ်းထားတယ် ဒါပေမဲ့ တင်မထားသေးဘူး
2. **scheduled** → scheduled_for အချိန်မှာ auto-publish လုပ်မယ်
3. **publishing** → အခု publish လုပ်နေတယ်
4. **published** → အောင်မြင်စွာ တင်ပြီးပြီ
5. **failed** → Publishing မအောင်မြင်ဘူး (post_results မှာ error ကို ကြည့်ပါ)

---

## 🚀 အမြန်ကိုးကား

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

## 📞 အကူအညီ လိုအပ်ပါက

ပြဿနာ ကြုံရင်:
1. PM2 logs ကြည့်ပါ: `pm2 logs social-symphony-api`
2. Database စစ်ပါ: `SELECT * FROM post_results WHERE status = 'failed' ORDER BY created_at DESC LIMIT 10;`
3. Channel connections စစ်ပါ: `SELECT platform, channel_name, is_active FROM connected_channels;`

---

**နောက်ဆုံး Update:** December 2, 2025
