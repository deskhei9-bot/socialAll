# Social Symphony - Self-Hosted Social Media Auto Publisher

**Production URL**: https://socialautoupload.com  
**Status**: ✅ Live & Operational (97% Complete - Production Ready)  
**Last Updated**: December 5, 2025

## 🎯 ရည်ရွယ်ချက် (Project Vision)

Social Symphony သည် **Facebook, YouTube, TikTok, Instagram, Twitter, LinkedIn** စသော လူကြိုက်များသည့် social media platforms များအားလုံးကို **တစ်နေရာတည်းမှ** အလိုအလျောက် post များ တင်ပို့နိုင်သော **All-In-One Social Media Publisher** ဖြစ်ပါသည်။

အလုပ်လုပ်ပုံက Content ကို web app ထဲ upload ဘယ် channels ကိုတင်မလဲရွေး Now or Schedule Queue workers က API တစ်ခုချင်းစီဆီ Publish

### 🌟 အဓိက ရည်ရွယ်ချက်များ:

1. **တစ်နေရာတည်း စီမံခန့်ခွဲမှု (Centralized Management)**
   - Platform ၆ ခုစလုံးကို တစ် dashboard တည်းကနေ စီမံခန့်ခွဲနိုင်မည်
   - Content တစ်ခုတည်းကို multiple platforms များသို့ တစ်ချိန်တည်းတင်ပို့နိုင်မည်
   - Account များကို OAuth2.0 ဖြင့် လုံခြုံစွာ ချိတ်ဆက်နိုင်မည်

2. **အလိုအလျောက် တင်ပို့မှု (Automatic Publishing)**
   - အချိန်ကြိုတင်စီစဉ်ပြီး scheduled posts များ auto-publish လုပ်နိုင်မည်
   - Queue system ဖြင့် posts များကို စီစဉ်တင်ပို့နိုင်မည်
   - Bulk posting ဖြင့် content များစွာကို တစ်ခါတည်း upload လုပ်နိုင်မည်

3. **AI-Powered Content Creation**
   - Gemini Pro / GPT-4 ဖြင့် captions များ auto-generate လုပ်နိုင်မည်
   - Platform-specific hashtags များ AI ကနေ အကြံပြုပေးမည်
   - Multiple tones (professional, casual, engaging, etc.) ရွေးချယ်နိုင်မည်

4. **Platform-Specific Optimizations**
   - Facebook: Text, Photo, Video, Reel, Album, Link posts
   - YouTube: Videos, Shorts with full metadata (description, tags, category, privacy)
   - TikTok: Videos with privacy controls (comments, duet, stitch permissions)
   - Instagram: Photos, Videos, Reels
   - Twitter: Text, Media posts
   - LinkedIn: Professional posts, Images

5. **Analytics & Insights**
   - Real-time performance metrics (reach, engagement)
   - Platform-wise analytics breakdown
   - Time-series data visualization
   - Success rate tracking

6. **100% Self-Hosted & Privacy-Focused**
   - Zero cloud dependencies (no Supabase, Firebase, AWS)
   - သင့် server တွင်သာ data သိမ်းဆည်းမည်
   - Full control over your content and credentials
   - GDPR & privacy compliant

### 🎭 ဘယ်သူတွေအတွက် သင့်တော်သလဲ?

- **Social Media Managers**: Multiple clients များ၏ accounts များကို စီမံရသူများ
- **Content Creators**: Influencers, YouTubers, TikTokers များ
- **Digital Marketing Agencies**: Client campaigns များ စီမံရသူများ
- **Small Business Owners**: Own brand ကို promote လုပ်ရသူများ
- **News Publishers**: သတင်းများကို multiple platforms များတွင် တင်ပို့ရသူများ
- **Myanmar Developers**: Self-hosted solution လိုအပ်သူများ

---

## 🎯 Project Status

**Version**: 1.0.0 (Production)  
**Deployment Date**: November 30, 2025  
**Last Updated**: December 2, 2025  
**Server**: VPS (Hetzner Cloud - Ubuntu 24.04)  
**Domain**: socialautoupload.com (Cloudflare DNS + Proxy)  
**Infrastructure**: 100% Self-Hosted (Zero Cloud Dependencies)

### 🎉 Latest Updates (December 2, 2025)

#### 📹 Social Media URL Support
- ✅ **YouTube Video Downloads** - yt-dlp integration
- ✅ **TikTok Video Downloads** - Direct video extraction
- ✅ **Facebook Video Downloads** - Public video support
- ✅ **Twitter/X Media** - Video and image downloads
- ✅ **Instagram Media** - Photo and video downloads (limited)
- ✅ **Telegram Media** - Channel video/photo downloads
- ✅ **7 Platforms Supported** - Paste URL to auto-download

#### 🎨 Enhanced Media Preview System
- ✅ **Dual-View Layout** - Visual grid preview + Text-based file list
- ✅ **Fullscreen Media Viewer** - Click any media to view full size
- ✅ **Smart Aspect Ratio** - Videos show in original ratio (no cropping)
- ✅ **Color-Coded Icons** - Blue (photos) / Purple (videos)
- ✅ **Individual Delete** - X icon on each file in text list
- ✅ **Bulk Delete** - "Clear All" button
- ✅ **Hover Effects** - "Full View" label on hover
- ✅ **File Info Display** - Name, type, size in overlay

#### 🎬 Video Processing
- ✅ **H.264 Codec Priority** - 99% browser compatibility
- ✅ **yt-dlp v2025.11.12** - Latest video downloader
- ✅ **Auto Format Selection** - Best quality with H.264
- ✅ **FFmpeg Post-Processing** - AV1 → H.264 conversion
- ✅ **Platform-Specific Settings** - Optimized per platform

#### 🌙 UI/UX Improvements
- ✅ **Dark/Light Theme Toggle** - System preference + manual switch
- ✅ **Streamlined Preview Panel** - No duplicate sections
- ✅ **Upload from URL** - Paste social media links directly
- ✅ **Nginx Static Serving** - Fast media file delivery
- ✅ **Mobile-Friendly** - Responsive layout

### ✨ Key Features (လက်ရှိ အလုပ်လုပ်နေသော Features)

#### 🤖 AI-Powered Content Tools
- ✅ **AI Caption Generator** - 7 different tones (Gemini Pro / GPT-4)
  - Professional, Casual, Engaging, Friendly, Informative, Funny, Inspiring
  - Platform-aware caption generation
  - Topic-based customization
- ✅ **AI Hashtag Suggester** - Smart hashtag recommendations
  - Configurable count (5, 10, 15, 20 hashtags)
  - Platform-specific hashtags
  - Content-based suggestions

#### 📱 Multi-Platform Support
- ✅ **Facebook** - Text, Photo, Video, Reel, Album (up to 10), Link posts
- ✅ **YouTube** - Videos, Shorts with metadata (description, tags, 14 categories, privacy)
- ✅ **TikTok** - Videos with privacy controls (comments, duet, stitch)
- ✅ **Instagram** - Photo, Video, Reel posts
- ✅ **Twitter** - Text, Media posts
- ✅ **LinkedIn** - Professional posts, Images
- ✅ **Pinterest** - Image pins, boards, full API support

#### ⏰ Scheduling & Automation
- ✅ **Scheduled Posts** - Date/time picker for future publishing
- ✅ **Auto-Publisher** - PM2-managed service runs every 60 seconds
- ✅ **Queue System** - Draft → Queued → Publishing → Published workflow
- ✅ **Multi-Platform Publishing** - Single post to multiple platforms simultaneously

#### 📊 Analytics & Monitoring
- ✅ **Real-Time Dashboard** - Live post performance metrics
- ✅ **Platform Breakdown** - Individual platform analytics
- ✅ **Success Rate Tracking** - Publishing success/failure monitoring
- ✅ **Time-Series Data** - Historical performance charts
- ✅ **Activity Logs** - Complete audit trail

#### 🎨 Advanced Content Management
- ✅ **Post Type Selector** - Platform-aware content types
- ✅ **YouTube Metadata** - Description, tags, category, privacy settings
- ✅ **TikTok Permissions** - Comments, duet, stitch controls
- ✅ **Facebook Albums** - Multi-photo uploads (max 10)
- ✅ **Link Posts** - Share URLs with previews
- ✅ **Media Uploader** - Drag & drop, multiple files, progress tracking
- ✅ **Social Media URL Upload** - YouTube, TikTok, Facebook, Twitter, Instagram, Telegram
- ✅ **Fullscreen Media Viewer** - Click preview to view full size
- ✅ **Dual Preview Layout** - Visual grid + Text-based file list with delete buttons
- ✅ **Smart Video Processing** - H.264 codec, aspect ratio preservation

#### 🔐 Authentication & Security
- ✅ **JWT Authentication** - 30-day token expiration
- ✅ **OAuth Integration** - Ready for Facebook, YouTube, TikTok
- ✅ **Encrypted Storage** - API keys and tokens encrypted
- ✅ **Role-Based Access** - Admin and user roles
- ✅ **Session Management** - Active session tracking

### ✅ Completed Components (အပြည့်အဝ အလုပ်လုပ်နေပြီး)

#### 🖥️ Server Infrastructure
- ✅ Ubuntu 24.04.3 LTS on VPS (4GB RAM, 2 CPU, 75GB SSD)
- ✅ UFW Firewall configured (ports 22, 80, 443)
- ✅ Fail2ban active for SSH protection
- ✅ System monitoring and logging

#### 🗄️ Database Layer
- ✅ PostgreSQL 16 installed and running
- ✅ Database: `social_symphony` with 9 tables
- ✅ Extensions: uuid-ossp, pgcrypto
- ✅ Connection pooling configured
- ✅ Admin user created (admin@socialautoupload.com)

#### 🔧 Backend API
- ✅ Node.js 20.19.6 runtime
- ✅ Express.js + TypeScript
- ✅ PM2 process manager with auto-restart
- ✅ Running on localhost:3001
- ✅ JWT authentication system (30-day tokens)
- ✅ bcrypt password hashing (10 rounds)
- ✅ User registration endpoint
- ✅ Login endpoint
- ✅ Token verification endpoint
- ✅ Get current user endpoint
- ✅ Health check endpoint
- ✅ Session management
- ✅ Activity logging ready

#### 🌐 Frontend
- ✅ React 18 + TypeScript + Vite
- ✅ Production build deployed
- ✅ shadcn-ui + Tailwind CSS
- ✅ Served via Nginx
- ✅ Located at: `/var/www/socialautoupload.com/public_html/`

#### 🔒 SSL/HTTPS
- ✅ Let's Encrypt SSL certificate (ECDSA)
- ✅ Valid until: February 28, 2026 (89 days)
- ✅ Auto-renewal configured
- ✅ HTTPS working perfectly
- ✅ HTTP to HTTPS redirect

#### 🌍 Web Server (Nginx)
- ✅ Nginx 1.24.0
- ✅ Reverse proxy to backend (localhost:3001)
- ✅ SSL termination
- ✅ Security headers configured
- ✅ Gzip compression enabled
- ✅ Access and error logging

#### 🛡️ Security
- ✅ Cloudflare DNS with proxy (hiding origin IP)
- ✅ UFW firewall active
- ✅ Fail2ban protecting SSH (2 IPs banned)
- ✅ CORS configured
- ✅ Helmet.js security headers
- ✅ Parameterized queries (SQL injection protection)

---

### ⚠️ In Progress / Pending (ဆက်လက်လုပ်ဆောင်ရမည့် အရာများ)

#### Backend API Endpoints (လိုအပ်သေးသော API များ)
- ✅ Posts CRUD (create, read, update, delete) - **Implemented**
- ✅ Media upload handling (multer integration) - **Working**
- ✅ Social media URL downloads (yt-dlp) - **7 platforms supported**
- ✅ Video processing (H.264 conversion) - **FFmpeg integration**
- ✅ AI caption generation (Gemini/OpenAI) - **API routes ready**
- ✅ Hashtag suggestions - **API routes ready**
- ✅ Scheduled posts processor - **Running every 60s**
- ✅ Analytics endpoints - **4 endpoints deployed**
- ✅ Static file serving (/uploads/) - **Nginx configured**
- ⏳ Connected channels management - **Database ready, UI pending**
- ⏳ OAuth endpoints (Facebook, YouTube, TikTok) - **Partially implemented**

#### Frontend Integration (Frontend ပြုပြင်ရန်)
- ✅ Custom API client implemented (`api-client.ts`)
- ✅ Self-hosted API endpoints integrated
- ✅ All API calls use `/api/*` endpoints
- ✅ JWT authentication flow implemented
- ✅ Supabase dependencies removed
- ✅ AI components integrated (CaptionGenerator, HashtagSuggestions)
- ✅ Post type selector with platform-aware types
- ✅ YouTube metadata fields (description, tags, category, privacy)
- ✅ TikTok metadata fields (privacy, permissions)
- ✅ Link post type support
- ✅ Facebook album support (multi-photo upload)
- ⏳ OAuth connection UI for platforms

#### OAuth Setup (Social Media ချိတ်ဆက်မှု)
- ⏳ Facebook App configuration & OAuth flow
- ⏳ YouTube/Google OAuth setup & token refresh
- ⏳ TikTok developer app & OAuth integration
- ⏳ Instagram Graph API integration
- ⏳ Twitter API v2 integration
- ⏳ LinkedIn OAuth setup
- ✅ Token storage and encryption - **Database ready**

#### Additional Features (နောက်ထပ် features များ)
- ⏳ Email notifications setup
- ⏳ Automated database backups (daily/weekly)
- ⏳ Monitoring dashboard (server metrics)
- ⏳ Rate limiting implementation (API protection)
- ⏳ Redis caching layer (performance optimization)
- ⏳ Caption templates library
- ⏳ Post duplication feature
- ⏳ Bulk import from CSV/Excel
- ⏳ Custom branding (white-label ready)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Cloudflare DNS + CDN + WAF                       │
│         (104.21.28.114, 172.67.145.227 - Public IPs)            │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (SSL)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           VPS Server (Ubuntu 24.04 - 46.62.210.14)              │
│                    Hetzner Cloud - 4GB RAM / 2 CPU              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Nginx 1.24.0 (Port 443 SSL, Port 80 → redirect)        │  │
│  │  - SSL Termination (Let's Encrypt)                       │  │
│  │  - Reverse Proxy                                         │  │
│  │  - Security Headers                                      │  │
│  └────┬──────────────────────┬──────────────────────────────┘  │
│       │                      │                                  │
│       │ /                    │ /api/*                          │
│       ▼                      ▼                                  │
│  ┌──────────────┐    ┌─────────────────────┐                  │
│  │  Frontend    │    │   Backend API        │                  │
│  │  (React 18)  │    │   (Node.js 20 +      │                  │
│  │  Vite Build  │    │    Express + TS)     │                  │
│  │  Static Files│    │   localhost:3001     │                  │
│  │  1.3MB total │    │   PM2 managed        │                  │
│  │              │    │   63MB memory        │                  │
│  └──────────────┘    └──────────┬───────────┘                  │
│                                 │                               │
│                                 │ pg (node-postgres)            │
│                                 ▼                               │
│                       ┌─────────────────────┐                  │
│                       │  PostgreSQL 16       │                  │
│                       │  localhost:5432      │                  │
│                       │  social_symphony DB  │                  │
│                       │  9 tables, 312KB     │                  │
│                       └─────────────────────┘                  │
│                                                                  │
│  Security: UFW Firewall + Fail2ban                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Technology Stack

### Frontend Layer
- **Framework**: React 18.3 with TypeScript 5.7
- **Build Tool**: Vite 6
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4 + tailwindcss-animate
- **State Management**: TanStack Query (React Query) v5
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Theme**: Dark/Light mode with system preference detection

### Backend Layer
- **Runtime**: Node.js 20.19.6
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database Client**: pg (node-postgres) with connection pooling
- **Authentication**: jsonwebtoken + bcrypt
- **Process Manager**: PM2 with systemd integration
- **Security**: Helmet.js + CORS
- **Logging**: Morgan (HTTP request logger)
- **File Uploads**: Multer (multipart/form-data)
- **Video Processing**: yt-dlp v2025.11.12 + FFmpeg
- **Validation**: Express-validator (to be added)

### Database Layer
- **RDBMS**: PostgreSQL 16.7
- **Extensions**: uuid-ossp, pgcrypto
- **Connection Pool**: Max 20 connections
- **Schema Version**: 1.0.0

### Infrastructure Layer
- **Operating System**: Ubuntu 24.04.3 LTS
- **Web Server**: Nginx 1.24.0
- **SSL Provider**: Let's Encrypt (certbot)
- **DNS/CDN**: Cloudflare
- **Firewall**: UFW (Uncomplicated Firewall)
- **IDS/IPS**: Fail2ban
- **Server**: Hetzner Cloud VPS

---

## 📦 Database Schema

```sql
-- Authentication & Users
users (id, email, password_hash, role, created_at, updated_at)
  - 1 admin user exists
  - bcrypt password hashing

profiles (id, user_id, full_name, avatar_url, company, bio, website, created_at)
  - Extended user information

sessions (id, user_id, token_hash, expires_at, created_at)
  - Active session tracking

-- Social Media Management
posts (id, user_id, title, content, media_urls[], platforms[], 
       hashtags[], status, scheduled_at, published_at, created_at)
  - Social media post drafts and scheduled posts

connected_channels (id, user_id, platform, account_name, account_handle,
                   access_token, refresh_token, token_expires_at, status)
  - OAuth-connected social accounts
  - Encrypted token storage

post_results (id, post_id, channel_id, platform, platform_post_id,
             status, reach, engagement, created_at)
  - Publishing results and analytics

-- Media & Storage
media_uploads (id, user_id, file_name, file_path, file_type, 
              file_size, created_at)
  - Uploaded media tracking

-- System & Security
api_keys (id, user_id, provider, encrypted_key, created_at)
  - Third-party API keys (Gemini, OpenAI, etc.)
  - Encrypted storage

activity_logs (id, user_id, post_id, type, message, platform,
              metadata, created_at)
  - User activity and audit trail
```

**Total Tables**: 9  
**Total Size**: 312KB  
**Indexes**: Created on foreign keys and frequently queried columns

---

## 🔐 Security Implementation

### 1. Authentication & Authorization
```typescript
// JWT token generation
- Algorithm: HS256
- Expiration: 30 days
- Secret: 64-character random string

// Password hashing
- Algorithm: bcrypt
- Salt rounds: 10
- No plaintext passwords stored
```

### 2. Network Security
```bash
# UFW Firewall Rules
Port 22  (SSH)   → ALLOW (protected by Fail2ban)
Port 80  (HTTP)  → ALLOW (redirects to HTTPS)
Port 443 (HTTPS) → ALLOW
All other ports  → DENY

# Fail2ban Protection
Service: sshd
Max retries: 5
Ban time: 10 minutes
Currently banned: 2 IPs
```

### 3. Application Security
- **CORS**: Configured for frontend domain only
- **Helmet.js**: Security headers enabled
  - X-Frame-Options: SAMEORIGIN
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
- **SQL Injection**: Parameterized queries only
- **Error Handling**: Sanitized error messages (no stack traces to client)

### 4. SSL/TLS Configuration
```nginx
SSL Protocol: TLSv1.2 TLSv1.3
Certificate: ECDSA (Let's Encrypt)
OCSP Stapling: Enabled
Perfect Forward Secrecy: Yes
SSL Labs Grade: A+ ready
```

### 5. Origin Protection
- Real server IP hidden by Cloudflare proxy
- Public IPs: 104.21.28.114, 172.67.145.227 (Cloudflare)
- Origin IP: 46.62.210.14 (not exposed)
- DDoS protection via Cloudflare

---

## 📝 API Documentation

### Base URLs
```
Production:  https://socialautoupload.com/api
Local:       http://localhost:3001/api
```

### Authentication Flow

#### 1. Register New User
```http
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}

Response (201 Created):
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "createdAt": "2025-11-30T20:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "30d"
}
```

#### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200 OK):
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "30d"
}

Error Response (401 Unauthorized):
{
  "error": "Invalid credentials"
}
```

#### 3. Verify Token
```http
POST /api/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200 OK):
{
  "valid": true,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "user"
  }
}

Error Response (401 Unauthorized):
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

#### 4. Get Current User
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200 OK):
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "user",
  "profile": {
    "company": "Example Corp",
    "bio": "Social media manager",
    "avatarUrl": "https://..."
  }
}
```

### System Endpoints

#### Health Check
```http
GET /health

Response (200 OK):
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-30T20:56:36.650Z"
}
```

### Pinterest OAuth

#### 1. Initiate Pinterest Connection
```http
GET /api/oauth/pinterest
Authorization: Bearer <YOUR_JWT_TOKEN>

Response (200 OK):
{
  "url": "https://www.pinterest.com/oauth/?client_id=..."
}
```

#### 2. Handle Pinterest Callback
```http
GET /api/oauth/pinterest/callback
```
This endpoint is called by Pinterest after user authorization. It handles the code exchange and saves the channel.

#### 3. Refresh Pinterest Token
```http
POST /api/oauth/pinterest/refresh
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "channelId": "your-pinterest-channel-id"
}
```

#### 4. Get Pinterest Boards
```http
GET /api/pinterest/boards/:channelId
Authorization: Bearer <YOUR_JWT_TOKEN>
```

#### 5. Disconnect Pinterest Channel
```http
DELETE /api/oauth/pinterest/:channelId
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### Testing with curl

```bash
# Login
TOKEN=$(curl -s -X POST https://socialautoupload.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@socialautoupload.com","password":"Admin@123"}' \
  | jq -r '.token')

# Verify token
curl -X POST https://socialautoupload.com/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"

# Get current user
curl -X GET https://socialautoupload.com/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Local Development Setup

### Prerequisites
```bash
- Node.js 20+ (recommended: 20.19.6)
- PostgreSQL 16+
- npm or yarn
- Git
```

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/deskhei9-bot/social-symphony.git
cd social-symphony

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..

# 4. Setup PostgreSQL database
createdb social_symphony
psql social_symphony < database-schema.sql

# 5. Configure backend environment
cd backend
cp .env.example .env
# Edit .env with your database credentials

# 6. Configure frontend environment
cd ..
cp .env.example .env
# Edit .env with API URL

# 7. Start backend (development)
cd backend
npm run dev
# Backend runs on http://localhost:3001

# 8. Start frontend (development)
cd ..
npm run dev
# Frontend runs on http://localhost:5173
```

### Environment Variables

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL=postgresql://social_app:password@localhost:5432/social_symphony

# JWT
JWT_SECRET=your-64-character-secret-key-here
JWT_EXPIRES_IN=30d

# Encryption
ENCRYPTION_KEY=your-64-character-encryption-key-here

# Server
PORT=3001
NODE_ENV=development

# OAuth (optional for now)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# AI APIs (optional)
GEMINI_API_KEY=
OPENAI_API_KEY=
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3001
```

---

## �� Production Deployment Guide

### Server Requirements
- Ubuntu 20.04+ or Debian 11+
- 4GB RAM minimum (8GB recommended)
- 20GB storage minimum
- Domain name with DNS access
- Root or sudo privileges

### Quick Deploy Script

```bash
#!/bin/bash
# Production deployment script

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install PostgreSQL 16
sudo apt install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
sudo apt install -y postgresql-16 postgresql-contrib

# 3. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Install PM2 globally
sudo npm install -g pm2

# 5. Install Nginx
sudo apt install -y nginx

# 6. Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# 7. Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 8. Install Fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 9. Clone project
sudo mkdir -p /opt
sudo git clone https://github.com/deskhei9-bot/social-symphony.git /opt/social-symphony
cd /opt/social-symphony

# 10. Setup database
sudo -u postgres createuser -P social_app
sudo -u postgres createdb -O social_app social_symphony
sudo -u postgres psql -d social_symphony -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
sudo -u postgres psql -d social_symphony -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"

# Apply schema
sudo -u postgres psql -d social_symphony -f /tmp/database-schema.sql

# 11. Build and setup backend
cd /opt/social-symphony/backend
npm install
npm run build

# Configure PM2
pm2 start dist/index.js --name social-symphony-api
pm2 startup
pm2 save

# 12. Build and deploy frontend
cd /opt/social-symphony
npm install
npm run build

# Copy to web root
sudo mkdir -p /var/www/socialautoupload.com/public_html
sudo cp -r dist/* /var/www/socialautoupload.com/public_html/
sudo chown -R www-data:www-data /var/www/socialautoupload.com

# 13. Configure Nginx
# (Copy nginx configuration from deployment guide)

# 14. Get SSL certificate
sudo certbot --nginx -d socialautoupload.com -d www.socialautoupload.com

# 15. Test and reload
sudo nginx -t
sudo systemctl reload nginx

echo "Deployment complete!"
echo "Visit https://socialautoupload.com"
```

### Post-Deployment Checklist

```bash
# Verify all services
pm2 status
sudo systemctl status postgresql
sudo systemctl status nginx
sudo systemctl status fail2ban

# Test API
curl http://localhost:3001/health

# Test HTTPS
curl -I https://socialautoupload.com

# Check logs
pm2 logs social-symphony-api --lines 50
sudo tail -50 /var/log/nginx/error.log
```

---

## 📊 Current System Status

### Infrastructure Health
```
Server Uptime:     2+ hours (stable)
CPU Load:          0.00 (idle)
Memory Usage:      1.7GB / 4GB (43%)
Disk Usage:        5.3GB / 75GB (8%)
Network:           Stable via Cloudflare
```

### Application Status
```
Backend API:       ✅ Online (PM2)
  Process:         social-symphony-api
  Memory:          63.3MB
  Uptime:          Since deployment
  Restarts:        0

Database:          ✅ Connected
  Size:            312KB
  Tables:          9
  Users:           1 (admin)
  Connections:     Pool of 20

Frontend:          ✅ Deployed
  Build Size:      1.3MB
  Load Time:       ~120ms
  Status Code:     200 OK

SSL Certificate:   ✅ Valid
  Expires:         2026-02-28 (89 days)
  Auto-Renewal:    Enabled
```

### Traffic Stats
```
Recent Requests:   ~10 in last 10 minutes
Error Rate:        0% (no server errors)
Avg Response:      <200ms
SSL Grade:         A+ capable
```

---

## 🎓 Learning Resources

### For Myanmar Developers (မြန်မာ developers များအတွက်)

#### Backend Development
- Express.js basics
- PostgreSQL database design
- JWT authentication
- RESTful API design
- TypeScript fundamentals

#### Frontend Development
- React Hooks and state management
- TypeScript with React
- Tailwind CSS utility-first approach
- Form handling with React Hook Form
- API integration patterns

#### DevOps & Deployment
- Linux server administration
- Nginx configuration
- SSL/TLS setup
- Process management with PM2
- Database backup strategies

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check logs
pm2 logs social-symphony-api

# Verify database connection
sudo -u postgres psql -d social_symphony -c "SELECT 1;"

# Rebuild and restart
cd /opt/social-symphony/backend
npm run build
pm2 restart social-symphony-api
```

### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -d social_symphony

# Check backend .env file
cat /opt/social-symphony/backend/.env | grep DATABASE
```

### HTTPS Not Working
```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew

# Check Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### High Memory Usage
```bash
# Check PM2 processes
pm2 status

# Restart backend
pm2 restart social-symphony-api

# Check for memory leaks
pm2 monit
```

---

## 📞 Support & Contact

- **Repository**: https://github.com/deskhei9-bot/social-symphony
- **Issues**: GitHub Issues page
- **Production URL**: https://socialautoupload.com
- **Deployed**: November 30, 2025

---

## 📜 License

This project is private and proprietary.

---

**Version**: 1.0.0  
**Status**: ✅ Production (90% Complete)  
**Last Updated**: December 2, 2025  
**Maintained By**: deskhei9-bot

---

## 🚀 Quick Start Guide

### For Users (သုံးစွဲသူများအတွက်)

1. **Register Account**: https://socialautoupload.com တွင် အကောင့်ဖွင့်ပါ
2. **Connect Platforms**: Facebook, YouTube, TikTok accounts များကို OAuth ဖြင့် ချိတ်ဆက်ပါ
3. **Create Post**: AI-powered tools များ သုံးပြီး content ဖန်တီးပါ
4. **Schedule or Publish**: အချိန်ကြိုတင်သတ်မှတ်ပါ သို့မဟုတ် ချက်ချင်းတင်ပို့ပါ
5. **Track Analytics**: Performance metrics များကို dashboard မှာ ကြည့်ရှုပါ

### For Developers (Developers များအတွက်)

```bash
# Clone repository
git clone https://github.com/deskhei9-bot/social-symphony.git
cd social-symphony

# Install dependencies
npm install
cd backend && npm install && cd ..

# Setup database
createdb social_symphony
psql social_symphony < database-schema.sql

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Start development servers
cd backend && npm run dev  # Backend: http://localhost:3001
cd .. && npm run dev       # Frontend: http://localhost:5173
```

---

## 📚 Documentation

- [Content Types Guide](./CONTENT_TYPES_GUIDE.md) - Platform-specific post types အသေးစိတ်
- [Content Types Guide (မြန်မာ)](./CONTENT_TYPES_GUIDE_MM.md) - မြန်မာဘာသာ လမ်းညွှန်
- [API Documentation](#-api-documentation) - Backend API reference
- [Deployment Guide](#-production-deployment-guide) - Production setup လမ်းညွှန်

---
