# OAuth Integration Setup Guide

This guide covers setting up OAuth integration for Facebook, YouTube, and TikTok platforms.

## Overview

The OAuth implementation supports:
- ✅ Facebook Pages (posting, video upload)
- ⏳ YouTube Channels (placeholder - needs implementation)
- ⏳ TikTok Creator accounts (placeholder - needs implementation)

## Prerequisites

- Backend server running at https://socialautoupload.com
- Database table `connected_channels` already configured
- User authentication working with JWT tokens

## 1. Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Business** as app type
4. Fill in app details:
   - App Name: "Social Auto Upload" (or your preferred name)
   - App Contact Email: your@email.com
5. Click **Create App**

### Step 2: Configure Facebook App

1. In the app dashboard, go to **Settings** → **Basic**
2. Note down:
   - **App ID**
   - **App Secret** (click Show)
3. Add **App Domains**: `socialautoupload.com`
4. Set **Privacy Policy URL** and **Terms of Service URL** (required for review)

### Step 3: Add Facebook Login Product

1. Click **Add Product** from left sidebar
2. Find **Facebook Login** and click **Set Up**
3. Select **Web** platform
4. Enter Site URL: `https://socialautoupload.com`
5. In **Facebook Login Settings**:
   - Valid OAuth Redirect URIs: `https://socialautoupload.com/api/oauth/facebook/callback`
   - Client OAuth Login: **Yes**
   - Web OAuth Login: **Yes**

### Step 4: Request Permissions

Required permissions for posting:
- `pages_manage_posts` - Create posts on Pages
- `pages_show_list` - Get list of Pages user manages
- `pages_read_engagement` - Read Page insights
- `publish_video` - Upload videos to Pages

**Note:** These permissions require app review from Facebook. For development/testing:
1. Add test users in **Roles** → **Test Users**
2. Test users can use all permissions without app review

### Step 5: Update Backend Environment

Edit `/opt/social-symphony/backend/.env`:

```bash
# Facebook OAuth
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
API_URL=https://socialautoupload.com/api
```

### Step 6: Restart Backend

```bash
pm2 restart social-symphony-api
```

### Step 7: Test Facebook OAuth

```bash
# Get OAuth initialization URL
curl -X GET https://socialautoupload.com/api/oauth/facebook/init \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected response:
{
  "url": "https://www.facebook.com/v18.0/dialog/oauth?...",
  "state": "random_state_string"
}
```

## 2. YouTube OAuth Setup (To Be Implemented)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Social Auto Upload"
3. Enable **YouTube Data API v3**

### Step 2: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure OAuth consent screen:
   - User Type: External
   - App name: "Social Auto Upload"
   - Support email: your@email.com
4. Create OAuth Client:
   - Application type: Web application
   - Authorized redirect URIs: `https://socialautoupload.com/api/oauth/youtube/callback`
5. Note down **Client ID** and **Client Secret**

### Step 3: Update Backend Environment

```bash
# YouTube OAuth
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
```

### Step 4: Implement YouTube Routes

Update `/opt/social-symphony/backend/src/routes/oauth.ts`:
- Implement `/youtube/init` endpoint
- Implement `/youtube/callback` endpoint
- Add YouTube API client for posting videos

**Required Scopes:**
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube.readonly`

## 3. TikTok OAuth Setup (To Be Implemented)

### Step 1: Register TikTok Developer Account

1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Sign up or login with TikTok account
3. Complete developer verification

### Step 2: Create TikTok App

1. Go to **My Apps** → **Create App**
2. Fill in app details:
   - App Name: "Social Auto Upload"
   - Category: Content Publishing
3. Submit for review

### Step 3: Configure OAuth Settings

1. In app settings, add:
   - Redirect URL: `https://socialautoupload.com/api/oauth/tiktok/callback`
2. Request scopes:
   - `video.upload` - Upload videos
   - `user.info.basic` - Get user profile

### Step 4: Update Backend Environment

```bash
# TikTok OAuth
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
```

### Step 5: Implement TikTok Routes

Update `/opt/social-symphony/backend/src/routes/oauth.ts`:
- Implement `/tiktok/init` endpoint
- Implement `/tiktok/callback` endpoint
- Add TikTok API client for uploading videos

## 4. Frontend Integration

The OAuth flow from user perspective:

1. User clicks "Connect Facebook/YouTube/TikTok" in frontend
2. Frontend calls `GET /api/oauth/{platform}/init` to get authorization URL
3. Frontend redirects user to authorization URL
4. User authorizes app on platform site
5. Platform redirects back to `/api/oauth/{platform}/callback`
6. Backend exchanges code for access token
7. Backend stores encrypted token in database
8. Backend redirects to frontend with success message
9. Frontend shows connected channel in UI

### Example Frontend Code

```typescript
// Connect Facebook account
async function connectFacebook() {
  try {
    // Get authorization URL
    const response = await fetch('https://socialautoupload.com/api/oauth/facebook/init', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    
    // Open OAuth popup
    const width = 600;
    const height = 700;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const popup = window.open(
      data.url,
      'Facebook OAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // Listen for OAuth completion
    window.addEventListener('message', (event) => {
      if (event.origin === 'https://socialautoupload.com') {
        if (event.data.success) {
          // Refresh connected channels list
          loadConnectedChannels();
        }
      }
    });
  } catch (error) {
    console.error('Failed to connect Facebook:', error);
  }
}
```

## 5. Testing OAuth Integration

### Check OAuth Status

```bash
curl -X GET https://socialautoupload.com/api/oauth/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response shows which platforms are configured:
{
  "facebook": true,
  "youtube": false,
  "tiktok": false
}
```

### Test OAuth Flow

1. Open browser to initialization URL
2. Authorize app on platform
3. Verify callback receives code
4. Check database for new connected_channels record:

```sql
SELECT * FROM connected_channels WHERE user_id = 'your_user_id';
```

### Verify Token Encryption

Tokens are encrypted in database using `ENCRYPTION_KEY` from environment:

```typescript
// Encryption happens in oauth.ts
const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
let encrypted = cipher.update(accessToken, 'utf8', 'hex');
encrypted += cipher.final('hex');
```

## 6. Security Considerations

### Required Security Measures

1. **Environment Variables**
   - Keep `.env` file secure with 600 permissions
   - Never commit credentials to git
   - Use different credentials for dev/staging/production

2. **Token Storage**
   - Access tokens encrypted in database
   - Refresh tokens stored separately (if applicable)
   - Implement token expiration checking

3. **OAuth State Validation**
   - Generate random state parameter in init endpoint
   - Store state in session/redis for callback validation
   - Prevent CSRF attacks

4. **HTTPS Only**
   - All OAuth callbacks must use HTTPS
   - Redirect URIs must match exactly
   - Use secure cookies for session management

### Current Implementation Status

✅ Encryption implemented for access tokens  
✅ HTTPS enforced via nginx  
⚠️ State validation partially implemented (needs session storage)  
⚠️ Token expiration checking not yet implemented  
❌ Refresh token logic not yet implemented  

## 7. Troubleshooting

### Error: "App ID not configured"

**Solution:** Add credentials to `/opt/social-symphony/backend/.env` and restart:
```bash
pm2 restart social-symphony-api
```

### Error: "redirect_uri_mismatch"

**Solution:** Verify OAuth callback URL matches exactly in platform settings:
- Facebook: Valid OAuth Redirect URIs
- Google: Authorized redirect URIs
- TikTok: Redirect URL

Expected: `https://socialautoupload.com/api/oauth/{platform}/callback`

### Error: "invalid_scope"

**Solution:** Request only approved scopes in platform developer console. For Facebook, test with test users before app review.

### Tokens Not Working After Some Time

**Solution:** Implement token refresh logic. Most platforms provide refresh tokens that can be used to get new access tokens without user interaction.

## 8. Next Steps

### Immediate (Required for Facebook)

1. ✅ OAuth routes implemented
2. ⏳ Add state validation with session storage
3. ⏳ Implement token expiration checking
4. ⏳ Add refresh token logic
5. ⏳ Create frontend OAuth connection UI

### Future (YouTube & TikTok)

1. ❌ Implement YouTube OAuth endpoints
2. ❌ Implement TikTok OAuth endpoints
3. ❌ Add platform-specific posting logic
4. ❌ Implement video upload to each platform
5. ❌ Add webhook handlers for platform events

## 9. Resources

### Official Documentation

- [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/business-login)
- [Facebook Pages API](https://developers.facebook.com/docs/pages)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [TikTok for Developers](https://developers.tiktok.com/doc/overview)

### API Rate Limits

| Platform | Rate Limit | Notes |
|----------|------------|-------|
| Facebook | 200 calls/hour per user | Can request increase |
| YouTube | 10,000 units/day | Video upload costs 1600 units |
| TikTok | 1000 calls/day | Per app, not per user |

### Support

For OAuth integration issues:
- Facebook: https://developers.facebook.com/support
- Google/YouTube: https://support.google.com/googleapi
- TikTok: https://developers.tiktok.com/support

---

**Last Updated:** 2025-12-01  
**Status:** Facebook OAuth structure complete, YouTube/TikTok placeholders  
**Version:** 1.0
