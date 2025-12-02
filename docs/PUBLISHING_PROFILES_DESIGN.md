# Publishing Profiles & Multi-Channel System Design

## 📋 **ပြဿနာ လက်ရှိအခြေအနေ (Current Problems)**

### 1. **Single Channel Per Platform Limitation**
```
လက်ရှိ System:
- 1 platform = 1 connected channel သာ
- Facebook Pages 10 ခု ရှိရင် 1 ခုပဲ select လုပ်လို့ရတယ်
- YouTube Channels များစွာ ရှိရင် 1 ခုပဲ connect လုပ်လို့ရတယ်

Database Schema (connected_channels):
✅ user_id + platform + channel_id = UNIQUE constraint ရှိပြီးသား
✅ Multiple channels per platform ကို support လုပ်ပြီးသား
❌ Frontend က select လုပ်မရသေးဘူး
```

### 2. **No Channel Selection in CreatePost**
```typescript
// လက်ရှိ CreatePost.tsx
const connectedChannels = getConnectedChannelsForPlatforms(selectedPlatforms);
// → Returns FIRST channel per platform only
// → User က specific channel select လုပ်လို့မရဘူး
```

### 3. **No Publishing Profiles/Scenarios**
```
User က scenarios တစ်ခု create လုပ်ချင်တယ်:
- "PT Profile" = Facebook Page A + YouTube Channel B + TikTok Account C
- "Company Profile" = Facebook Page D + LinkedIn Company Page E
- "Personal Brand" = All platforms, specific channels

လက်ရှိ system မှာ မရှိသေးဘူး။
```

---

## 🎨 **Solution Design**

### **Option 1: Multi-Channel Selector (Simple Solution) ⭐ Recommended**

#### အလုပ်လုပ်ပုံ:
1. User က Platform select လုပ်တယ် (e.g., Facebook)
2. System က Facebook channels အားလုံးကို list လုပ်တယ်
3. User က ဘယ် channel(s) မှာ publish မလဲ checkbox နဲ့ select လုပ်တယ်
4. Publish လုပ်တဲ့အခါ selected channels အားလုံးကို publish တယ်

#### UI Design:
```
┌─ Select Platforms ─────────────────────────┐
│ [✓] Facebook  [✓] YouTube  [ ] Instagram   │
└────────────────────────────────────────────┘

┌─ Select Channels ──────────────────────────┐
│ Facebook (3 channels available):           │
│   [✓] PT Business Page (125K followers)    │
│   [ ] Personal Page (5K followers)         │
│   [✓] E-Commerce Store (50K followers)     │
│                                             │
│ YouTube (2 channels available):            │
│   [✓] Main Channel (100K subs)             │
│   [ ] Tutorial Channel (20K subs)          │
└────────────────────────────────────────────┘

[Publish to 3 Channels] button
```

#### Database Changes:
```sql
-- No database changes needed!
-- connected_channels table already supports multiple channels per platform

-- posts table needs minor update:
ALTER TABLE posts ADD COLUMN selected_channel_ids UUID[];

-- post_results table already has channel_id:
-- When publishing, create one post_result per channel
```

#### Code Changes Required:

**1. Update `usePublishPost.tsx`:**
```typescript
// Change from:
const getConnectedChannelsForPlatforms = (platforms: string[]) => {
  return channels.filter(ch => platforms.includes(ch.platform) && ch.is_active);
};

// To: Return ALL channels for selected platforms
const getChannelsForPlatforms = (platforms: string[]) => {
  return channels.filter(ch => platforms.includes(ch.platform) && ch.is_active);
};

// Add new function:
const publishToChannels = async (
  channelIds: string[],
  post: { title, content, mediaUrls }
) => {
  const results = [];
  for (const channelId of channelIds) {
    const channel = channels.find(ch => ch.id === channelId);
    if (!channel) continue;
    
    // Publish to specific channel
    const result = await publishToChannel(channel, post);
    results.push(result);
  }
  return results;
};
```

**2. Update `CreatePost.tsx`:**
```typescript
// Add state:
const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);

// Get available channels:
const availableChannels = getChannelsForPlatforms(selectedPlatforms);

// Group by platform:
const channelsByPlatform = availableChannels.reduce((acc, ch) => {
  if (!acc[ch.platform]) acc[ch.platform] = [];
  acc[ch.platform].push(ch);
  return acc;
}, {} as Record<string, Channel[]>);

// UI: Channel Selection Section
{Object.entries(channelsByPlatform).map(([platform, channels]) => (
  <div key={platform}>
    <Label>{platform} ({channels.length} channels)</Label>
    {channels.map(channel => (
      <Checkbox
        key={channel.id}
        checked={selectedChannelIds.includes(channel.id)}
        onCheckedChange={(checked) => {
          if (checked) {
            setSelectedChannelIds(prev => [...prev, channel.id]);
          } else {
            setSelectedChannelIds(prev => prev.filter(id => id !== channel.id));
          }
        }}
      >
        {channel.account_name} ({channel.followers_count} followers)
      </Checkbox>
    ))}
  </div>
))}
```

---

### **Option 2: Publishing Profiles/Scenarios (Advanced Solution)**

#### အလုပ်လုပ်ပုံ:
1. User က Profile တစ်ခု create လုပ်တယ် (e.g., "PT Profile")
2. Profile မှာ channels တွေကို select လုပ်ပြီး save ထားတယ်
3. CreatePost မှာ Profile select လုပ်ရုံနဲ့ အဲဒီ channels အားလုံးကို auto-select လုပ်တယ်

#### Database Schema:
```sql
-- New table: publishing_profiles
CREATE TABLE publishing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL, -- "PT Profile", "Company", etc.
  description TEXT,
  channel_ids UUID[] NOT NULL, -- Array of selected channel IDs
  is_default BOOLEAN DEFAULT false,
  color VARCHAR(20), -- UI color tag
  icon VARCHAR(50), -- UI icon
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for fast lookup
CREATE INDEX idx_publishing_profiles_user ON publishing_profiles(user_id);

-- Ensure channel IDs belong to user
CREATE OR REPLACE FUNCTION validate_profile_channels()
RETURNS TRIGGER AS $$
BEGIN
  -- Check all channel_ids belong to this user
  IF EXISTS (
    SELECT 1 FROM unnest(NEW.channel_ids) AS channel_id
    WHERE NOT EXISTS (
      SELECT 1 FROM connected_channels 
      WHERE id = channel_id AND user_id = NEW.user_id
    )
  ) THEN
    RAISE EXCEPTION 'Invalid channel IDs for this user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_profile_channels_trigger
BEFORE INSERT OR UPDATE ON publishing_profiles
FOR EACH ROW EXECUTE FUNCTION validate_profile_channels();
```

#### UI Design:
```
┌─ Publishing Profiles ───────────────────────┐
│ Quick Select:                               │
│ [PT Profile (3)] [Company (5)] [+New]       │
│                                             │
│ Selected: PT Profile                        │
│ ├─ Facebook: PT Business Page              │
│ ├─ YouTube: Main Channel                   │
│ └─ TikTok: PT Official                     │
│                                             │
│ Or select platforms manually:              │
│ [ ] Facebook  [ ] YouTube  [ ] TikTok      │
└────────────────────────────────────────────┘
```

#### API Endpoints:
```typescript
// backend/src/routes/publishing-profiles.ts

// GET /api/publishing-profiles - Get all profiles for user
router.get('/', async (req, res) => {
  const { user_id } = req.user;
  const profiles = await pool.query(
    'SELECT * FROM publishing_profiles WHERE user_id = $1 ORDER BY name',
    [user_id]
  );
  res.json(profiles.rows);
});

// POST /api/publishing-profiles - Create new profile
router.post('/', async (req, res) => {
  const { user_id } = req.user;
  const { name, description, channel_ids, color, icon } = req.body;
  
  const result = await pool.query(
    `INSERT INTO publishing_profiles 
     (user_id, name, description, channel_ids, color, icon)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [user_id, name, description, channel_ids, color, icon]
  );
  
  res.json(result.rows[0]);
});

// PUT /api/publishing-profiles/:id - Update profile
// DELETE /api/publishing-profiles/:id - Delete profile
```

---

## 🔍 **Comparison: Option 1 vs Option 2**

| Feature | Option 1 (Multi-Select) | Option 2 (Profiles) |
|---------|------------------------|---------------------|
| **Ease of Implementation** | ⭐⭐⭐⭐⭐ Very Easy | ⭐⭐⭐ Medium |
| **User Experience** | Simple, direct | Advanced, requires learning |
| **Database Changes** | None (add 1 column) | New table + triggers |
| **Backend Changes** | Minimal | New API routes |
| **Frontend Changes** | Update CreatePost.tsx | CreatePost + Profiles page |
| **Best For** | Quick fix, most users | Power users, agencies |
| **Development Time** | 2-3 hours | 1-2 days |

---

## 🎯 **Recommended Implementation Plan**

### **Phase 1: Multi-Channel Selector (Now)**
✅ Implement Option 1 first
- Simple, fast, solves 90% of use cases
- No database migrations
- Easy to test and deploy

### **Phase 2: Publishing Profiles (Later)**
✅ Add Option 2 as enhancement
- For power users and agencies
- Can coexist with Option 1
- Users can choose: "Quick Select" or "Use Profile"

---

## 📝 **Implementation Steps (Phase 1)**

### Step 1: Database Migration
```sql
-- Add selected_channel_ids to posts table
ALTER TABLE posts ADD COLUMN selected_channel_ids UUID[];

-- Add comment
COMMENT ON COLUMN posts.selected_channel_ids IS 'Array of channel IDs to publish to';
```

### Step 2: Update Backend (`backend/src/routes/publish.ts`)
```typescript
// When creating post, save selected_channel_ids
const { selected_channel_ids } = req.body;

// When publishing, use selected_channel_ids instead of platforms
const selectedChannels = await pool.query(
  'SELECT * FROM connected_channels WHERE id = ANY($1)',
  [selected_channel_ids]
);

// Publish to each selected channel
for (const channel of selectedChannels.rows) {
  await publishToChannel(channel, post);
}
```

### Step 3: Update Frontend
**A. Update `usePublishPost.tsx`:**
```typescript
export function usePublishPost() {
  // ... existing code ...
  
  const getChannelsForPlatforms = (platforms: string[]) => {
    return channels.filter(ch => 
      platforms.includes(ch.platform) && ch.is_active
    );
  };
  
  const publishToSelectedChannels = async (
    channelIds: string[],
    postId: string,
    title: string,
    content: string,
    mediaUrls: string[]
  ) => {
    // ... publish logic ...
  };
  
  return {
    // ... existing exports ...
    getChannelsForPlatforms,
    publishToSelectedChannels,
  };
}
```

**B. Update `CreatePost.tsx`:**
```tsx
// Add state
const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);

// Get channels
const { getChannelsForPlatforms } = usePublishPost();
const availableChannels = getChannelsForPlatforms(selectedPlatforms);

// Group by platform
const channelsByPlatform = availableChannels.reduce((acc, ch) => {
  if (!acc[ch.platform]) acc[ch.platform] = [];
  acc[ch.platform].push(ch);
  return acc;
}, {} as Record<string, Channel[]>);

// Auto-select all when platform is selected
useEffect(() => {
  if (selectedPlatforms.length > 0) {
    const channelIds = availableChannels.map(ch => ch.id);
    setSelectedChannelIds(channelIds);
  }
}, [selectedPlatforms]);

// UI: Add Channel Selection Section after Platform Selection
```

### Step 4: New UI Component
```tsx
// src/components/ChannelSelector.tsx
interface ChannelSelectorProps {
  channels: Channel[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function ChannelSelector({ 
  channels, 
  selectedIds, 
  onSelectionChange 
}: ChannelSelectorProps) {
  // Group channels by platform
  const grouped = channels.reduce((acc, ch) => {
    if (!acc[ch.platform]) acc[ch.platform] = [];
    acc[ch.platform].push(ch);
    return acc;
  }, {} as Record<string, Channel[]>);
  
  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([platform, platformChannels]) => (
        <div key={platform} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold capitalize">
              {platform} ({platformChannels.length} channels)
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const allSelected = platformChannels.every(ch => 
                  selectedIds.includes(ch.id)
                );
                if (allSelected) {
                  // Deselect all
                  onSelectionChange(
                    selectedIds.filter(id => 
                      !platformChannels.find(ch => ch.id === id)
                    )
                  );
                } else {
                  // Select all
                  const newIds = platformChannels
                    .map(ch => ch.id)
                    .filter(id => !selectedIds.includes(id));
                  onSelectionChange([...selectedIds, ...newIds]);
                }
              }}
            >
              Select All
            </Button>
          </div>
          
          <div className="grid gap-2">
            {platformChannels.map(channel => {
              const isSelected = selectedIds.includes(channel.id);
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    if (isSelected) {
                      onSelectionChange(
                        selectedIds.filter(id => id !== channel.id)
                      );
                    } else {
                      onSelectionChange([...selectedIds, channel.id]);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                    isSelected 
                      ? "border-primary bg-primary/10" 
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {/* Checkbox */}
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center",
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  
                  {/* Channel Info */}
                  <div className="flex-1">
                    <p className="font-medium">{channel.account_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {channel.account_handle} • {formatNumber(channel.followers_count)} followers
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <Badge variant="secondary" className="text-xs">
                    {channel.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 **Final UI Flow**

```
┌─────────────────────────────────────────────────────────┐
│ 1. SELECT PLATFORMS                                     │
│    [✓] Facebook  [✓] YouTube  [ ] Instagram            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. SELECT CHANNELS (Expandable Section)                │
│                                                         │
│    ▼ Facebook (3 channels) ─────────── [Select All]    │
│      [✓] PT Business Page                              │
│          @ptbusiness • 125K followers • Active         │
│      [ ] Personal Page                                 │
│          @mypage • 5K followers • Active               │
│      [✓] E-Commerce Store                              │
│          @store • 50K followers • Active               │
│                                                         │
│    ▼ YouTube (2 channels) ──────────── [Select All]    │
│      [✓] Main Channel                                  │
│          Main Channel • 100K subs • Active             │
│      [ ] Tutorial Channel                              │
│          Tutorials • 20K subs • Active                 │
│                                                         │
│    Selected: 3 channels                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Publish to 3 Channels] button                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 **Benefits**

✅ **Flexibility**: User က platform တစ်ခုမှာ channels များစွာ select လုပ်လို့ရတယ်  
✅ **Granular Control**: Specific channels တွေကိုပဲ publish လို့ရတယ်  
✅ **Database Ready**: လက်ရှိ schema က support လုပ်ပြီးသား  
✅ **Scalable**: Future မှာ Profiles feature add လို့ရတယ်  
✅ **User Friendly**: Auto-select all channels, manual override လုပ်လို့ရတယ်  

---

## 📊 **Make.com Style Scenarios (Future Enhancement)**

အနာဂတ်မှာ ထည့်လို့ရမဲ့ features:

### 1. **Workflow Builder**
```
Trigger: New Post Created
  ↓
Condition: If post_type = "video"
  ↓
Action: Publish to YouTube + TikTok only
  ↓
Action: Send notification to Telegram
```

### 2. **Smart Channel Selection Rules**
```sql
CREATE TABLE channel_selection_rules (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(100),
  conditions JSONB, -- { "post_type": "video", "hashtags_include": "#tech" }
  channel_ids UUID[],
  priority INTEGER
);

-- Example rule:
{
  "name": "Tech Videos",
  "conditions": {
    "post_type": "video",
    "hashtags": ["#tech", "#coding"],
    "content_contains": ["tutorial", "guide"]
  },
  "channel_ids": ["youtube-main", "tiktok-tech", "linkedin-company"]
}
```

### 3. **Bulk Publishing Campaigns**
```
Campaign: "Product Launch"
├─ Post 1: Announcement (All platforms)
├─ Post 2: Demo Video (YouTube, TikTok)
├─ Post 3: Behind the Scenes (Instagram, Facebook)
└─ Post 4: Customer Reviews (All platforms)

Schedule:
- Day 1: Post 1 at 9 AM
- Day 2: Post 2 at 2 PM
- Day 3: Post 3 at 10 AM
- Day 7: Post 4 at 3 PM
```

---

## 💡 **Conclusion**

အခု design က သင့် website project အတွက် complete solution ဖြစ်ပါတယ်။

**Immediate Solution (Phase 1):**
- Multi-channel selector ကို implement လုပ်ပါ
- 2-3 hours development time
- Database migration minimal
- Solves 90% of use cases

**Future Enhancement (Phase 2):**
- Publishing Profiles system
- Workflow automation
- Smart rules engine
- Make.com style scenarios

ကျွန်တော် implement လုပ်ပေးရမလား? ဘယ် phase ကို ခုချက်ချင်း စလုပ်ချင်သလဲ?
