# Social Symphony - Multi-Platform Social Media Publisher

<div align="center">

**🚀 All-in-One Social Media Auto Publisher**

[![Production Status](https://img.shields.io/badge/Status-Live-success)](https://socialautoupload.com)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)]()

**Production**: [socialautoupload.com](https://socialautoupload.com)  
**Status**: ✅ Live & Operational (85% Complete)  
**Last Updated**: February 2, 2026

</div>

---

## 📖 Quick Navigation

- [Overview](#-overview) | [Features](#-features) | [Platforms](#-supported-platforms)
- [Technology](#-technology-stack) | [Architecture](#-architecture) 
- [Getting Started](#-getting-started) | [Documentation](#-documentation)
- [Status](#-project-status) | [Roadmap](#-roadmap)

---

## 🎯 Overview

**Social Symphony** is a powerful, self-hosted social media management platform that enables publishing content across **7 major social media platforms** from a single unified dashboard.

### What is Social Symphony?

- 📝 **Create Once, Publish Everywhere**: Single interface for all platforms
- ⏰ **Smart Scheduling**: Auto-publish at optimal times
- 🤖 **AI-Powered**: Generate captions and hashtags with AI
- 📊 **Analytics Dashboard**: Track performance across platforms
- 🔒 **Self-Hosted**: Complete data control and privacy

### မြန်မာဘာသာ (Myanmar Language)

Social Symphony သည် **Facebook, YouTube, TikTok, Instagram, Twitter, LinkedIn, Pinterest** စသော လူကြိုက်များသည့် social media platforms ၇ ခုကို **တစ်နေရာတည်းမှ** အလိုအလျောက် post များ တင်ပို့နိုင်သော **All-In-One Social Media Publisher** ဖြစ်ပါသည်။

**အဓိက အားသာချက်များ:**
- ✅ Platform ၇ ခုကို တစ် dashboard တည်းကနေ စီမံခန့်ခွဲ
- ✅ AI ဖြင့် captions နှင့် hashtags auto-generate
- ✅ အချိန်ကြိုတင်သတ်မှတ်ပြီး scheduled posts
- ✅ Analytics dashboard ဖြင့် performance tracking
- ✅ 100% Self-hosted - သင့် server တွင်သာ data သိမ်းဆည်း

[**📖 Myanmar Language Documentation →**](./README_MM.md)

---

## ✨ Key Features

### 🚀 Multi-Platform Publishing
- **7 Platforms**: Facebook, YouTube, TikTok, Instagram, Twitter, LinkedIn, Pinterest
- **Bulk Publishing**: Post to multiple platforms simultaneously
- **Post Types**: Text, images, videos, albums, reels, shorts
- **Scheduling**: Auto-publish with PM2 background service (60s interval)

### 🤖 AI-Powered Content Tools
- **Caption Generator**: 7 tones (Professional, Casual, Engaging, Friendly, Informative, Funny, Inspiring)
- **Hashtag Suggester**: 5-20 smart hashtags per platform
- **Platform-Aware**: Optimized content for each social network
- **APIs**: Gemini Pro / GPT-4 integration

### 📹 Media Management
- **File Upload**: Drag & drop with progress tracking
- **URL Download**: YouTube, TikTok, Facebook, Twitter, Instagram, Telegram (7 platforms)
- **Smart Processing**: H.264 codec, AV1→H.264 conversion, aspect ratio preservation
- **Preview System**: Visual grid + text list, fullscreen viewer, individual delete

### 📊 Analytics & Insights
- **Real-Time Dashboard**: Live performance metrics
- **Platform Breakdown**: Individual platform analytics
- **Success Tracking**: Publishing success/failure rates
- **Activity Logs**: Complete audit trail

### 🔐 Security & Authentication
- **JWT Auth**: 30-day token expiration
- **OAuth Ready**: Social platform integration (Pinterest ✅ Live)
- **Encrypted Storage**: API keys and tokens encrypted
- **Role-Based Access**: Admin and user roles

---

## 🌐 Supported Platforms

| Platform | Status | OAuth | Post Types | Analytics |
|----------|--------|-------|------------|-----------|
| **Facebook** | ✅ API Ready | ⏳ Pending | Text, Photo, Video, Reel, Album, Link | ✅ Yes |
| **YouTube** | ✅ API Ready | ⏳ Pending | Video, Short | ✅ Yes |
| **TikTok** | ✅ API Ready | ⏳ Pending | Video | ✅ Yes |
| **Instagram** | ✅ API Ready | ⏳ Pending | Photo, Video, Reel | ✅ Yes |
| **Twitter/X** | ✅ API Ready | ⏳ Pending | Text, Media | ✅ Yes |
| **LinkedIn** | ✅ API Ready | ⏳ Pending | Text, Image | ✅ Yes |
| **Pinterest** | ✅ **LIVE** | ✅ Working | Image, Pin | ✅ Yes |

**✅ API Ready**: Backend implemented, OAuth pending  
**✅ LIVE**: Fully operational with OAuth  
**⏳ Pending**: Planned for implementation

---

## 🛠 Technology Stack

### Frontend
- React 18.3 + TypeScript 5.7 + Vite 6
- shadcn/ui + Tailwind CSS 3.4
- TanStack Query (React Query) v5
- React Router v6 + React Hook Form
- Lucide Icons + Recharts + date-fns

### Backend
- Node.js 20.19.6 + Express.js 4.x
- TypeScript 5.x + PM2 process manager
- JWT auth + bcrypt password hashing
- Multer (uploads) + yt-dlp + FFmpeg

### Database & Infrastructure
- PostgreSQL 16.7 with connection pooling
- Ubuntu 24.04 LTS + Nginx 1.24.0
- Let's Encrypt SSL + Cloudflare CDN
- UFW Firewall + Fail2ban
- Hetzner Cloud VPS (4GB RAM, 2 CPU, 75GB SSD)

---

## 🏗 System Architecture

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

```

**Components:**
- **Cloudflare**: DNS + CDN + DDoS protection
- **Nginx**: Reverse proxy + SSL termination + static files
- **Backend API**: Express + TypeScript on Port 3001 (PM2 managed)
- **Frontend**: React SPA served as static files
- **PostgreSQL**: Database with 9 tables, connection pooling
- **Security**: UFW firewall + Fail2ban + JWT auth

---

## 📦 Database Schema

**9 Tables** | **PostgreSQL 16** | **Size: ~312KB**

```sql
users              # User accounts (JWT auth, bcrypt passwords)
profiles           # Extended user information
sessions           # Active session tracking
posts              # Social media posts (drafts, scheduled, published)
connected_channels # OAuth-connected social accounts
post_results       # Publishing results and analytics
media_uploads      # Uploaded media tracking
api_keys           # Third-party API keys (encrypted)
activity_logs      # User activity audit trail
```

**Features:**
- UUID primary keys
- Encrypted token storage (pgcrypto)
- Connection pooling (max 20)
- Parameterized queries (SQL injection protection)

---

## 🔐 Security Implementation

### Authentication
- **JWT Tokens**: HS256 algorithm, 30-day expiration
- **Password Hashing**: bcrypt with 10 salt rounds
- **OAuth Ready**: Token storage with encryption

### Network Security
```bash
UFW Firewall:
- Port 22 (SSH)   → ALLOW (Fail2ban protected)
- Port 80 (HTTP)  → ALLOW (→ HTTPS redirect)
- Port 443 (HTTPS) → ALLOW
- All other ports  → DENY

Fail2ban: 5 retries, 10min ban
Currently banned: 2 IPs
```

### Application Security
- **CORS**: Configured for frontend domain only
- **Helmet.js**: Security headers (X-Frame-Options, CSP, etc.)
- **SQL Injection**: Parameterized queries only
- **Error Handling**: Sanitized error messages

### SSL/TLS
- **Protocol**: TLSv1.2 + TLSv1.3
- **Certificate**: Let's Encrypt ECDSA
- **OCSP Stapling**: Enabled
- **Grade**: A+ capable

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 20+, PostgreSQL 16+, npm/yarn, Git
Optional: FFmpeg, yt-dlp
```

### Quick Start (Development)
```bash
# 1. Clone and install
git clone <repository-url>
cd social-symphony
npm install && cd backend && npm install && cd ..

# 2. Setup database
createdb social_symphony
psql social_symphony < database/schema.sql

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# 4. Start development servers
cd backend && npm run dev      # → http://localhost:3001
cd .. && npm run dev           # → http://localhost:5173
```

### Production Deployment
See **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** for detailed instructions.

---

## 📚 Documentation

### 📘 Essential Docs
| Document | Description |
|----------|-------------|
| **[📑 Documentation Index](./docs/INDEX.md)** | Complete docs navigation |
| **[🚀 Quick Start Guide](./docs/QUICK_START.md)** | Get started in 5 minutes |
| **[📖 API Documentation](./docs/API_DOCUMENTATION.md)** | REST API reference |
| **[🔑 OAuth Setup](./docs/OAUTH_SETUP.md)** | Social media integration |
| **[🚢 Deployment Guide](./DEPLOYMENT_GUIDE.md)** | Production setup |
| **[📝 Content Types Guide](./CONTENT_TYPES_GUIDE.md)** | Platform post types |
| **[🏠 Self-Hosting Guide](./SELF-HOSTING.md)** | Run on your server |

### 🇲🇲 Myanmar Language
- [README (မြန်မာ)](./README_MM.md)
- [Content Types (မြန်မာ)](./CONTENT_TYPES_GUIDE_MM.md)
- [Publishing Profiles (မြန်မာ)](./PUBLISHING_PROFILES_GUIDE_MM.md)

### 🔧 Developer Docs
- [Backend README](./backend/README.md)
- [Changelog](./CHANGELOG.md)
- [Project Roadmap](./PROJECT_ROADMAP.md)
- [Secrets/Environment](./SECRETS.md)

---

## 📊 Project Status

**Version**: 1.0.0  
**Deployed**: November 30, 2025  
**Last Updated**: February 2, 2026  
**Status**: ✅ Production (85% Complete)

### Current Implementation

| Component | Progress | Status |
|-----------|----------|--------|
| **Infrastructure** | 100% | ✅ Complete |
| **Backend API** | 90% | ✅ Prod Ready |
| **Frontend** | 85% | ✅ Prod Ready |
| **Database** | 100% | ✅ Complete |
| **Security** | 95% | ✅ Prod Ready |
| **OAuth** | 15% | ⏳ In Progress |
| **Documentation** | 90% | ✅ Complete |
| **Overall** | **85%** | **✅ Production** |

### ✅ Completed (Production Ready)

**Infrastructure & Deployment**
- ✅ VPS server (Ubuntu 24.04, Hetzner Cloud)
- ✅ Nginx + SSL (Let's Encrypt) + Cloudflare CDN
- ✅ Firewall (UFW) + Fail2ban
- ✅ PM2 process management + systemd

**Backend API (18/20 endpoints)**
- ✅ Authentication (register, login, verify, me)
- ✅ Posts CRUD (create, list, update, delete)
- ✅ Media upload (Multer + file validation)
- ✅ Social URL downloads (7 platforms via yt-dlp)
- ✅ Video processing (FFmpeg H.264 conversion)
- ✅ AI caption generation (Gemini/GPT-4)
- ✅ Hashtag suggestions
- ✅ Scheduled posts processor (PM2 service)
- ✅ Analytics (4 endpoints)
- ✅ Health check
- ⏳ OAuth (Pinterest ✅, others pending)

**Frontend Application**
- ✅ React 18 + TypeScript SPA
- ✅ Authentication UI (login, register)
- ✅ Dashboard with analytics charts
- ✅ Post creation interface
- ✅ Media uploader (drag & drop, URL input)
- ✅ Fullscreen media viewer
- ✅ AI tools (caption generator, hashtag suggester)
- ✅ Scheduled posts calendar
- ✅ Dark/Light theme toggle
- ✅ Responsive mobile design

**Database**
- ✅ PostgreSQL 16 with 9 tables
- ✅ Connection pooling (max 20)
- ✅ Encrypted token storage
- ✅ UUID primary keys

### ⏳ In Progress

**OAuth Integration** (High Priority)
- ✅ Pinterest OAuth (Complete)
- ⏳ Facebook App Review + OAuth
- ⏳ YouTube/Google OAuth
- ⏳ TikTok OAuth
- ⏳ Instagram Graph API
- ⏳ Twitter API v2
- ⏳ LinkedIn OAuth

**Additional Features**
- ⏳ Email notifications
- ⏳ Automated backups
- ⏳ Rate limiting
- ⏳ Redis caching
- ⏳ Post templates
- ⏳ Bulk import (CSV/Excel)

---

## 🗺 Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] Infrastructure + Database + Authentication
- [x] Basic post creation + Media upload

### Phase 2: Core Features ✅ (Complete)
- [x] Multi-platform API + Scheduling
- [x] AI tools + Analytics + URL downloads

### Phase 3: OAuth Integration 🔄 (In Progress)
- [x] Pinterest ✅
- [ ] Facebook, YouTube, TikTok, Instagram, Twitter, LinkedIn

### Phase 4: Advanced Features 📅 (Planned)
- [ ] Notifications + Templates + Bulk import
- [ ] Team collaboration + Advanced analytics

### Phase 5: Enterprise 🔮 (Future)
- [ ] Multi-user + White-label + Mobile app
- [ ] Browser extension + Integrations

---

## 👥 Who Should Use This?

### Perfect For:
- **Social Media Managers** - Managing multiple client accounts
- **Content Creators** - Influencers, YouTubers, TikTokers
- **Digital Agencies** - Running campaigns across platforms
- **Small Businesses** - Promoting your brand
- **News Publishers** - Distributing content
- **Myanmar Developers** - Self-hosted solutions

### Use Cases:
- Schedule a week's posts in one session
- Post to all platforms simultaneously
- Generate AI captions in seconds
- Track analytics across accounts
- Self-host with complete privacy

---

## 🌟 Why Social Symphony?

### ✅ **100% Self-Hosted**
- No cloud dependencies (no Supabase, Firebase, AWS)
- Your data stays on your server
- GDPR & privacy compliant
- Full control

### ⚡ **Modern Technology**
- React 18 + TypeScript
- Fast Vite build
- PostgreSQL database
- PM2 process management

### 🤖 **AI-Powered**
- Gemini Pro + GPT-4
- Smart captions
- Intelligent hashtags

### 🔒 **Production Ready**
- SSL/TLS encryption
- Cloudflare CDN
- Monitoring & logging
- Automated backups ready

### 👨‍💻 **Developer Friendly**
- Clean TypeScript code
- Comprehensive API docs
- Easy to extend

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`feature/amazing-feature`)
3. Follow TypeScript + ESLint standards
4. Write tests (coverage > 80%)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and private.

---

## 📞 Contact & Support

- **Production**: [socialautoupload.com](https://socialautoupload.com)
- **Status**: ✅ Live & Operational
- **Documentation**: [docs/INDEX.md](./docs/INDEX.md)
- **Version**: 1.0.0

---

<div align="center">

**Version 1.0.0** | **February 2, 2026**

[📚 Docs](./docs/INDEX.md) • [🚀 Quick Start](./docs/QUICK_START.md) • [📖 API](./docs/API_DOCUMENTATION.md) • [📝 Changelog](./CHANGELOG.md)

**Made with 🚀 for Myanmar Developers**

</div>

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
