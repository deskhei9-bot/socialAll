# Publishing Profiles Guide

## Overview

Publishing Profiles allow you to save your favorite channel combinations for quick one-click publishing. Perfect for managing multiple brands across many social media platforms.

## Use Case

**Problem:** You manage multiple brands (e.g., "PT", "Company A", "Personal") across 10+ platforms (Facebook, TikTok, YouTube, Instagram, LinkedIn, etc.). Manually selecting channels every time is tedious.

**Solution:** Create profiles like "PT Profile" that group all PT-branded channels. Click once to publish to all PT channels across all platforms.

## Features

### ✨ Quick Select Profiles
- One-click selection of channel combinations
- Visual indicators with custom colors and icons
- See channel count at a glance
- Auto-load default profile on page load

### 🎨 Customization
- **Name:** Descriptive profile names (e.g., "PT Brand", "Personal", "Company Official")
- **Description:** Optional notes about the profile
- **Color:** 8 preset colors for visual identification
- **Icon:** 6 icon options (Folder, Star, Briefcase, User, Lightning, Target)
- **Default:** Mark one profile as default for auto-selection

### 🔒 Safety Features
- Database validation prevents invalid channel IDs
- Only your own channels can be added to profiles
- Automatic cleanup when channels are deleted
- Ownership verification on all operations

## How to Use

### 1. Create a Profile

1. Go to **Create Post** page
2. Select your platforms (e.g., Facebook, TikTok, YouTube)
3. Click **"+ New"** or **"Create Profile"** button
4. Fill in profile details:
   - **Profile Name:** e.g., "PT Brand"
   - **Description:** e.g., "All PT branded channels across all platforms"
   - **Color:** Choose a color for visual identification
   - **Icon:** Select an icon
5. **Select Channels:** Check all channels that belong to this profile
6. **Set as Default:** (Optional) Auto-select this profile when creating posts
7. Click **"Create Profile"**

### 2. Use a Profile

1. Go to **Create Post** page
2. Select your platforms
3. In the **Quick Select Profiles** section, you'll see:
   - **Manual** option (for custom selection)
   - Your saved profiles
4. Click on a profile to instantly select all its channels
5. Create your post as usual

### 3. Switch Modes

**Profile Mode:**
- Click any profile button
- All profile channels are auto-selected
- Selected profile is highlighted with a checkmark

**Manual Mode:**
- Click the "Manual" button
- Or manually check/uncheck channels
- Gives you full control over channel selection

### 4. Edit or Delete Profiles

(Coming in future update)
- Edit profile name, description, colors, icons
- Add or remove channels from existing profiles
- Delete profiles you no longer need

## Example Scenarios

### Scenario 1: Multiple Brands
**Your Situation:**
- Brand 1: "PT" (10 pages on Facebook, 10 accounts on TikTok, 10 channels on YouTube)
- Brand 2: "Company A" (5 pages on Facebook, 3 accounts on Instagram)
- Brand 3: "Personal" (1 page per platform)

**Solution:**
- Create **"PT Profile"** with all PT channels (30+ channels)
- Create **"Company A Profile"** with all Company A channels (8 channels)
- Create **"Personal Profile"** with personal channels (5 channels)

**Publishing:**
- Click "PT Profile" → Publish to all PT channels instantly
- Click "Company A Profile" → Publish to Company A channels
- Click "Personal Profile" → Publish to personal channels

### Scenario 2: Campaign-Based
**Your Situation:**
- Running a product launch campaign
- Want to publish to specific high-engagement channels only

**Solution:**
- Create **"High Engagement Profile"** with top-performing channels
- Create **"Full Reach Profile"** with all channels
- Create **"Test Profile"** with 1-2 channels for testing

**Publishing:**
- Test post first with "Test Profile"
- Launch to "High Engagement Profile" first
- Follow up with "Full Reach Profile" later

### Scenario 3: Multi-Language
**Your Situation:**
- English content for international channels
- Myanmar content for local channels

**Solution:**
- Create **"International Profile"** with English-language channels
- Create **"Myanmar Profile"** with Myanmar-language channels

**Publishing:**
- English post → Click "International Profile"
- Myanmar post → Click "Myanmar Profile"

## Database Schema

```sql
CREATE TABLE publishing_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  channel_ids UUID[] NOT NULL,
  is_default BOOLEAN DEFAULT false,
  color VARCHAR(20) DEFAULT '#3b82f6',
  icon VARCHAR(50) DEFAULT 'folder',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_publishing_profiles_user ON publishing_profiles(user_id);

-- Validation trigger
CREATE TRIGGER validate_profile_channels_trigger
BEFORE INSERT OR UPDATE ON publishing_profiles
FOR EACH ROW EXECUTE FUNCTION validate_profile_channels();
```

## API Endpoints

All endpoints require authentication.

### List Profiles
```http
GET /api/publishing-profiles
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "PT Profile",
    "description": "All PT branded channels",
    "channel_ids": ["uuid1", "uuid2", "uuid3"],
    "is_default": true,
    "color": "#3b82f6",
    "icon": "briefcase",
    "created_at": "2024-12-02T10:00:00Z",
    "updated_at": "2024-12-02T10:00:00Z"
  }
]
```

### Get Single Profile
```http
GET /api/publishing-profiles/:id
```

### Create Profile
```http
POST /api/publishing-profiles
Content-Type: application/json

{
  "name": "PT Profile",
  "description": "All PT branded channels",
  "channel_ids": ["uuid1", "uuid2"],
  "is_default": true,
  "color": "#3b82f6",
  "icon": "briefcase"
}
```

### Update Profile
```http
PUT /api/publishing-profiles/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "channel_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### Delete Profile
```http
DELETE /api/publishing-profiles/:id
```

### Get Profile Channels
```http
GET /api/publishing-profiles/:id/channels
```

Returns full channel objects for the profile.

## React Hooks

### usePublishingProfiles

```typescript
import { usePublishingProfiles } from '@/hooks/usePublishingProfiles';

function MyComponent() {
  const {
    profiles,           // Array of profiles
    loading,            // Loading state
    createProfile,      // Create function
    updateProfile,      // Update function
    deleteProfile,      // Delete function
    getProfileChannels, // Get channel details
    refetch            // Manually refresh
  } = usePublishingProfiles();

  // Create a profile
  const handleCreate = async () => {
    await createProfile(
      'PT Profile',
      'All PT channels',
      ['channel-id-1', 'channel-id-2'],
      true,  // is_default
      '#3b82f6',  // color
      'briefcase' // icon
    );
  };

  // Update a profile
  const handleUpdate = async (profileId: string) => {
    await updateProfile(profileId, {
      name: 'Updated Name',
      channel_ids: ['new-channel-id']
    });
  };

  // Delete a profile
  const handleDelete = async (profileId: string) => {
    await deleteProfile(profileId);
  };

  return (
    <div>
      {profiles.map(profile => (
        <div key={profile.id}>{profile.name}</div>
      ))}
    </div>
  );
}
```

## Components

### ProfileSelector

Quick-select buttons for choosing profiles.

```tsx
<ProfileSelector
  profiles={profiles}
  selectedProfileId={selectedProfileId}
  onSelectProfile={handleProfileSelect}
  onCreateProfile={() => setManagerOpen(true)}
  channelCount={selectedChannelIds.length}
/>
```

### ProfileManager

Dialog for creating and editing profiles.

```tsx
<ProfileManager
  open={managerOpen}
  onOpenChange={setManagerOpen}
  onSave={handleSaveProfile}
  editProfile={editingProfile}  // Optional: for editing
/>
```

## Best Practices

### 1. Naming Conventions
- Use descriptive names: ✅ "PT Brand - All Channels"
- Avoid generic names: ❌ "Profile 1"
- Include platform info if needed: ✅ "PT - Facebook Only"

### 2. Color Coding
- Use consistent colors across related profiles
- Example: Blue for corporate, Green for personal, Red for urgent/testing

### 3. Default Profile
- Set your most-used profile as default
- Only one profile can be default at a time
- Default profiles auto-load on page load

### 4. Regular Maintenance
- Update profiles when adding new channels
- Remove channels that are no longer active
- Delete unused profiles to keep the list clean

### 5. Testing
- Create a "Test Profile" with 1-2 low-risk channels
- Use it to test posts before publishing to main profiles
- Prevents mistakes on important channels

## Troubleshooting

### Profile Not Saving
- **Check:** Are all selected channels still connected?
- **Fix:** Remove disconnected channels and try again

### Channels Not Auto-Selecting
- **Check:** Is the profile selected (highlighted)?
- **Fix:** Click the profile button again

### Default Profile Not Loading
- **Check:** Is your browser cache cleared?
- **Fix:** Refresh the page (Ctrl+R or Cmd+R)

### Cannot Delete Profile
- **Check:** Are you the profile owner?
- **Fix:** Only the user who created a profile can delete it

## Future Enhancements

### Planned Features
- [ ] Edit existing profiles in UI
- [ ] Duplicate profiles
- [ ] Profile sharing between team members
- [ ] Profile templates (pre-configured for common scenarios)
- [ ] Schedule different profiles for different times
- [ ] Analytics: Track which profiles perform best

### API Enhancements
- [ ] Bulk profile operations
- [ ] Profile import/export
- [ ] Profile versioning
- [ ] Profile usage analytics

## Technical Details

### Validation
The database uses a trigger function to validate channel IDs:

```sql
CREATE OR REPLACE FUNCTION validate_profile_channels()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all channel_ids belong to the user
  IF EXISTS (
    SELECT 1 FROM unnest(NEW.channel_ids) AS channel_id
    WHERE NOT EXISTS (
      SELECT 1 FROM connected_channels cc
      WHERE cc.id = channel_id AND cc.user_id = NEW.user_id
    )
  ) THEN
    RAISE EXCEPTION 'Invalid channel_ids: some channels do not belong to the user';
  END IF;

  -- Auto-unset other defaults if this is default
  IF NEW.is_default THEN
    UPDATE publishing_profiles
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Performance
- Indexed on `user_id` for fast queries
- Channel IDs stored as PostgreSQL array (UUID[])
- Efficient validation via database triggers
- Frontend caching reduces API calls

### Security
- All endpoints require authentication
- Users can only access their own profiles
- Channel ownership verified before save
- SQL injection prevention via parameterized queries

## Support

If you encounter any issues:

1. Check browser console for error messages
2. Verify backend API is running (`pm2 list`)
3. Check database connection (`SELECT * FROM publishing_profiles;`)
4. Review network requests in browser DevTools
5. Contact support with error details

---

**Version:** 1.0.0  
**Last Updated:** December 2, 2024  
**Phase:** Phase 2 Complete
