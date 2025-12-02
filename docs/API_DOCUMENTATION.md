# Social Symphony API Documentation

**Base URL:** `https://socialautoupload.com/api`  
**Version:** 1.0  
**Authentication:** Bearer JWT Token  

---

## Table of Contents

1. [Authentication](#authentication)
2. [Posts Management](#posts-management)
3. [Channels Management](#channels-management)
4. [Media Upload](#media-upload)
5. [OAuth Integration](#oauth-integration)
6. [Users Management](#users-management)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Validation:**
- Email: Must be valid email format, unique
- Password: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "20d0ecf7-2a40-47b3-97e3-832259f25799",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid email format or weak password
- `409 Conflict`: Email already registered

**Example:**
```bash
curl -X POST https://socialautoupload.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"MySecure123"}'
```

---

### POST /auth/login

Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "20d0ecf7-2a40-47b3-97e3-832259f25799",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Errors:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials

**Example:**
```bash
curl -X POST https://socialautoupload.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123"}'
```

---

### GET /auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "20d0ecf7-2a40-47b3-97e3-832259f25799",
    "email": "user@example.com",
    "role": "user",
    "profile": {
      "id": "profile-uuid",
      "full_name": null,
      "avatar_url": null,
      "bio": null,
      "preferences": {}
    },
    "created_at": "2025-01-31T10:30:45.123Z"
  }
}
```

**Errors:**
- `401 Unauthorized`: Invalid or expired token

**Example:**
```bash
curl -X GET https://socialautoupload.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Posts Management

### GET /posts

Get all posts for the authenticated user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
```
?status=draft|scheduled|published|failed  (optional)
?platform=facebook|youtube|tiktok          (optional)
?limit=20                                  (optional, default: 50)
?offset=0                                  (optional, default: 0)
```

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": "post-uuid",
      "user_id": "user-uuid",
      "title": "My First Post",
      "content": "This is the post content...",
      "platforms": ["facebook", "youtube"],
      "status": "draft",
      "scheduled_for": "2025-02-01T10:00:00Z",
      "media_url": "https://socialautoupload.com/uploads/images/filename.jpg",
      "metadata": {
        "hashtags": ["social", "media"],
        "mentions": []
      },
      "created_at": "2025-01-31T10:30:45.123Z",
      "updated_at": "2025-01-31T10:30:45.123Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**Example:**
```bash
curl -X GET "https://socialautoupload.com/api/posts?status=draft&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### GET /posts/:id

Get a single post by ID.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "id": "post-uuid",
  "user_id": "user-uuid",
  "title": "My First Post",
  "content": "This is the post content...",
  "platforms": ["facebook", "youtube"],
  "status": "draft",
  "scheduled_for": "2025-02-01T10:00:00Z",
  "media_url": "https://socialautoupload.com/uploads/images/filename.jpg",
  "metadata": {},
  "created_at": "2025-01-31T10:30:45.123Z",
  "updated_at": "2025-01-31T10:30:45.123Z"
}
```

**Errors:**
- `404 Not Found`: Post doesn't exist or doesn't belong to user

**Example:**
```bash
curl -X GET https://socialautoupload.com/api/posts/POST_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### POST /posts

Create a new post.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My New Post",
  "content": "This is the content of my post...",
  "platforms": ["facebook", "youtube", "tiktok"],
  "status": "draft",
  "scheduled_for": "2025-02-01T10:00:00Z",
  "media_url": "https://socialautoupload.com/uploads/images/filename.jpg",
  "metadata": {
    "hashtags": ["social", "media"],
    "facebook_options": {
      "page_id": "123456789"
    }
  }
}
```

**Field Descriptions:**
- `title` (required): Post title (max 255 chars)
- `content` (required): Post content (max 5000 chars)
- `platforms` (required): Array of platforms, min 1
  - Valid values: `facebook`, `youtube`, `tiktok`
- `status` (optional): Default `draft`
  - Valid values: `draft`, `scheduled`, `published`
- `scheduled_for` (optional): ISO 8601 timestamp, required if status is `scheduled`
- `media_url` (optional): URL to uploaded media file
- `metadata` (optional): JSON object for additional settings

**Response (201 Created):**
```json
{
  "id": "new-post-uuid",
  "user_id": "user-uuid",
  "title": "My New Post",
  "content": "This is the content of my post...",
  "platforms": ["facebook", "youtube", "tiktok"],
  "status": "draft",
  "scheduled_for": "2025-02-01T10:00:00Z",
  "media_url": "https://socialautoupload.com/uploads/images/filename.jpg",
  "metadata": {},
  "created_at": "2025-01-31T10:45:00.000Z",
  "updated_at": "2025-01-31T10:45:00.000Z"
}
```

**Errors:**
- `400 Bad Request`: Invalid field values
- `401 Unauthorized`: Missing or invalid token

**Example:**
```bash
curl -X POST https://socialautoupload.com/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "This is a test post",
    "platforms": ["facebook"],
    "status": "draft"
  }'
```

---

### PUT /posts/:id

Update an existing post.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "platforms": ["facebook"],
  "status": "scheduled",
  "scheduled_for": "2025-02-02T15:00:00Z",
  "media_url": "https://socialautoupload.com/uploads/images/new-file.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": "post-uuid",
  "user_id": "user-uuid",
  "title": "Updated Title",
  "content": "Updated content...",
  "platforms": ["facebook"],
  "status": "scheduled",
  "scheduled_for": "2025-02-02T15:00:00Z",
  "media_url": "https://socialautoupload.com/uploads/images/new-file.jpg",
  "metadata": {},
  "created_at": "2025-01-31T10:45:00.000Z",
  "updated_at": "2025-01-31T11:00:00.000Z"
}
```

**Errors:**
- `404 Not Found`: Post doesn't exist
- `403 Forbidden`: Post doesn't belong to user
- `400 Bad Request`: Invalid field values

**Example:**
```bash
curl -X PUT https://socialautoupload.com/api/posts/POST_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

---

### DELETE /posts/:id

Delete a post.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "message": "Post deleted successfully"
}
```

**Errors:**
- `404 Not Found`: Post doesn't exist
- `403 Forbidden`: Post doesn't belong to user

**Example:**
```bash
curl -X DELETE https://socialautoupload.com/api/posts/POST_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Channels Management

### GET /channels

Get all connected social media channels for the user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
```
?platform=facebook|youtube|tiktok  (optional)
?is_active=true|false              (optional)
```

**Response (200 OK):**
```json
{
  "channels": [
    {
      "id": "channel-uuid",
      "user_id": "user-uuid",
      "platform": "facebook",
      "channel_id": "123456789",
      "channel_name": "My Facebook Page",
      "is_active": true,
      "expires_at": "2025-12-31T23:59:59Z",
      "created_at": "2025-01-31T10:00:00.000Z",
      "updated_at": "2025-01-31T10:00:00.000Z"
    }
  ]
}
```

**Note:** `access_token` and `refresh_token` are never returned in API responses for security.

**Example:**
```bash
curl -X GET "https://socialautoupload.com/api/channels?platform=facebook" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### GET /channels/:id

Get a single channel by ID.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "id": "channel-uuid",
  "user_id": "user-uuid",
  "platform": "facebook",
  "channel_id": "123456789",
  "channel_name": "My Facebook Page",
  "is_active": true,
  "expires_at": "2025-12-31T23:59:59Z",
  "created_at": "2025-01-31T10:00:00.000Z",
  "updated_at": "2025-01-31T10:00:00.000Z"
}
```

**Errors:**
- `404 Not Found`: Channel doesn't exist or doesn't belong to user

---

### POST /channels

Manually add a channel (primarily for OAuth callback use).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "platform": "facebook",
  "channel_id": "123456789",
  "channel_name": "My Facebook Page",
  "access_token": "long_lived_access_token",
  "refresh_token": "refresh_token_if_available",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Field Descriptions:**
- `platform` (required): Must be `facebook`, `youtube`, or `tiktok`
- `channel_id` (required): Platform-specific channel identifier
- `channel_name` (required): Display name for the channel
- `access_token` (required): OAuth access token (will be encrypted)
- `refresh_token` (optional): OAuth refresh token (will be encrypted)
- `expires_at` (optional): Token expiration timestamp

**Response (201 Created):**
```json
{
  "id": "new-channel-uuid",
  "user_id": "user-uuid",
  "platform": "facebook",
  "channel_id": "123456789",
  "channel_name": "My Facebook Page",
  "is_active": true,
  "expires_at": "2025-12-31T23:59:59Z",
  "created_at": "2025-01-31T11:00:00.000Z",
  "updated_at": "2025-01-31T11:00:00.000Z"
}
```

**Errors:**
- `400 Bad Request`: Invalid platform or missing required fields
- `409 Conflict`: Channel already connected (unique constraint on user_id + platform + channel_id)

**Example:**
```bash
curl -X POST https://socialautoupload.com/api/channels \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "facebook",
    "channel_id": "123456789",
    "channel_name": "Test Page",
    "access_token": "token_here",
    "expires_at": "2025-12-31T23:59:59Z"
  }'
```

---

### DELETE /channels/:id

Disconnect a channel.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "message": "Channel removed successfully"
}
```

**Errors:**
- `404 Not Found`: Channel doesn't exist
- `403 Forbidden`: Channel doesn't belong to user

**Example:**
```bash
curl -X DELETE https://socialautoupload.com/api/channels/CHANNEL_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Media Upload

### POST /upload/single

Upload a single media file (image or video).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Request Body:**
```
Form field: "file"
Supported formats:
  - Images: JPEG, PNG, GIF, WebP
  - Videos: MP4, MOV, AVI, WebM
Max size: 100MB
```

**Response (200 OK):**
```json
{
  "success": true,
  "file": {
    "id": "media-uuid",
    "filename": "original-filename.jpg",
    "url": "https://socialautoupload.com/uploads/images/1234567890-hash.jpg",
    "size": 125430,
    "mimeType": "image/jpeg"
  }
}
```

**Errors:**
- `400 Bad Request`: No file provided or invalid file type
- `413 Payload Too Large`: File exceeds 100MB
- `500 Internal Server Error`: File save failed

**Example:**
```bash
curl -X POST https://socialautoupload.com/api/upload/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

### POST /upload/multiple

Upload multiple media files at once.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Request Body:**
```
Form field: "files" (array)
Max files: 10 per request
Each file max: 100MB
```

**Response (200 OK):**
```json
{
  "success": true,
  "files": [
    {
      "id": "media-uuid-1",
      "filename": "image1.jpg",
      "url": "https://socialautoupload.com/uploads/images/1234567890-hash1.jpg",
      "size": 125430,
      "mimeType": "image/jpeg"
    },
    {
      "id": "media-uuid-2",
      "filename": "image2.png",
      "url": "https://socialautoupload.com/uploads/images/1234567891-hash2.png",
      "size": 234567,
      "mimeType": "image/png"
    }
  ]
}
```

**Errors:**
- `400 Bad Request`: No files provided or invalid file types
- `413 Payload Too Large`: Any file exceeds 100MB

**Example:**
```bash
curl -X POST https://socialautoupload.com/api/upload/multiple \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg"
```

---

### GET /upload/media

Get list of uploaded media files for the user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
```
?limit=20   (optional, default: 50)
?offset=0   (optional, default: 0)
```

**Response (200 OK):**
```json
{
  "media": [
    {
      "id": "media-uuid",
      "filename": "original-filename.jpg",
      "file_path": "/opt/social-symphony/uploads/images/1234567890-hash.jpg",
      "url": "https://socialautoupload.com/uploads/images/1234567890-hash.jpg",
      "file_size": 125430,
      "mime_type": "image/jpeg",
      "created_at": "2025-01-31T10:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**Example:**
```bash
curl -X GET "https://socialautoupload.com/api/upload/media?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### DELETE /upload/media/:id

Delete an uploaded media file.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Media file deleted successfully"
}
```

**Errors:**
- `404 Not Found`: Media file doesn't exist
- `403 Forbidden`: Media file doesn't belong to user
- `500 Internal Server Error`: File deletion failed

**Example:**
```bash
curl -X DELETE https://socialautoupload.com/api/upload/media/MEDIA_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## OAuth Integration

### GET /oauth/status

Check which OAuth platforms are configured.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "facebook": true,
  "youtube": false,
  "tiktok": false
}
```

**Note:** Returns `true` if platform credentials are configured in `.env`, `false` otherwise.

**Example:**
```bash
curl -X GET https://socialautoupload.com/api/oauth/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### GET /oauth/facebook/init

Initialize Facebook OAuth flow.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "url": "https://www.facebook.com/v18.0/dialog/oauth?client_id=...&redirect_uri=...&scope=...&state=...",
  "state": "random_state_string_for_csrf_protection"
}
```

**Frontend Usage:**
1. Call this endpoint to get authorization URL
2. Open URL in popup window or redirect user
3. User authorizes app on Facebook
4. Facebook redirects to callback URL
5. Backend handles callback and stores tokens

**Errors:**
- `400 Bad Request`: Facebook App ID not configured

**Example:**
```bash
curl -X GET https://socialautoupload.com/api/oauth/facebook/init \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### GET /oauth/facebook/callback

Facebook OAuth callback handler (called by Facebook, not by frontend).

**Query Parameters:**
```
?code=AUTHORIZATION_CODE
?state=STATE_STRING
```

**Response:**
Redirects to frontend with result:
```
Success: https://socialautoupload.com/oauth/success?platform=facebook
Error:   https://socialautoupload.com/oauth/error?message=error_description
```

**Note:** This endpoint is called automatically by Facebook after user authorization.

---

### POST /oauth/facebook/complete

Complete Facebook OAuth flow (alternative to callback redirect).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "authorization_code_from_facebook",
  "state": "state_string_from_init"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "channel": {
    "id": "channel-uuid",
    "platform": "facebook",
    "channel_id": "123456789",
    "channel_name": "My Facebook Page"
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid code or state
- `500 Internal Server Error`: OAuth exchange failed

---

### GET /oauth/youtube/init

**Status:** ⏳ Not yet implemented

Initialize YouTube OAuth flow.

**Expected Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "random_state_string"
}
```

---

### GET /oauth/tiktok/init

**Status:** ⏳ Not yet implemented

Initialize TikTok OAuth flow.

**Expected Response:**
```json
{
  "url": "https://www.tiktok.com/auth/authorize/?...",
  "state": "random_state_string"
}
```

---

## Users Management

### GET /users

Get list of all users (admin only).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "user",
      "created_at": "2025-01-31T10:00:00.000Z"
    }
  ]
}
```

**Errors:**
- `403 Forbidden`: User is not admin

---

### GET /users/:id

Get user by ID.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "profile": {
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "Developer"
  },
  "created_at": "2025-01-31T10:00:00.000Z",
  "updated_at": "2025-01-31T10:00:00.000Z"
}
```

**Errors:**
- `404 Not Found`: User doesn't exist
- `403 Forbidden`: Not authorized to view this user

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (e.g., email already exists) |
| 413 | Payload Too Large | File upload exceeds 100MB |
| 500 | Internal Server Error | Server-side error, check logs |

### Common Error Examples

**Invalid Token:**
```json
{
  "error": "Invalid or expired token"
}
```

**Validation Error:**
```json
{
  "error": "Password must be at least 8 characters"
}
```

**Not Found:**
```json
{
  "error": "Post not found"
}
```

---

## Rate Limiting

### Current Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| All endpoints | 100 requests | per minute |
| /auth/register | 5 requests | per hour |
| /auth/login | 10 requests | per minute |

**Note:** Rate limiting is currently handled at nginx level. More granular per-user rate limiting will be implemented in the future.

### Rate Limit Headers

When rate limited, you'll receive a 429 response:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": "Too many requests. Please try again later."
}
```

---

## Best Practices

### Authentication
1. Store JWT token securely (localStorage or httpOnly cookie)
2. Include token in all protected requests
3. Handle 401 errors by redirecting to login
4. Implement token refresh logic

### File Uploads
1. Validate file types before upload
2. Show progress indicator for large files
3. Handle 413 errors gracefully
4. Compress images when possible

### Error Handling
1. Always check response status code
2. Display user-friendly error messages
3. Log errors for debugging
4. Implement retry logic for 5xx errors

### Performance
1. Use pagination for large lists
2. Cache responses when appropriate
3. Batch operations when possible
4. Minimize API calls with proper frontend state management

---

## SDK/Client Libraries

### JavaScript/TypeScript

```typescript
// Example API client implementation
class SocialSymphonyAPI {
  constructor(private baseURL: string, private token?: string) {}

  setToken(token: string) {
    this.token = token;
  }

  private async request(method: string, endpoint: string, data?: any) {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async register(email: string, password: string) {
    return this.request('POST', '/auth/register', { email, password });
  }

  async login(email: string, password: string) {
    const result = await this.request('POST', '/auth/login', { email, password });
    this.setToken(result.token);
    return result;
  }

  // Posts methods
  async getPosts(filters?: { status?: string; platform?: string }) {
    const params = new URLSearchParams(filters as any);
    return this.request('GET', `/posts?${params}`);
  }

  async createPost(data: any) {
    return this.request('POST', '/posts', data);
  }

  // Upload methods
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: any = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/upload/single`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

// Usage
const api = new SocialSymphonyAPI('https://socialautoupload.com/api');

// Login
const { token, user } = await api.login('user@example.com', 'password');

// Create post
const post = await api.createPost({
  title: 'My Post',
  content: 'Content here',
  platforms: ['facebook'],
  status: 'draft'
});

// Upload file
const file = document.querySelector('input[type="file"]').files[0];
const uploaded = await api.uploadFile(file);
```

---

## Changelog

### Version 1.0 (2025-12-01)
- ✅ Initial API release
- ✅ Authentication endpoints
- ✅ Posts CRUD operations
- ✅ Channels management
- ✅ Media upload system
- ✅ Facebook OAuth structure
- ⏳ YouTube OAuth (planned)
- ⏳ TikTok OAuth (planned)

---

**Documentation Version:** 1.0  
**Last Updated:** 2025-12-01  
**API Base URL:** https://socialautoupload.com/api
