# Social Symphony Backend API

**Status**: ✅ Production (Partially Complete)  
**Runtime**: Node.js 20.19.6  
**Framework**: Express.js + TypeScript  
**Process Manager**: PM2  
**Port**: 3001 (localhost only)

---

## 📋 Current Implementation Status

### ✅ Implemented Features

#### Authentication System
- **User Registration**: POST `/api/auth/register`
  - bcrypt password hashing (10 rounds)
  - Automatic profile creation
  - JWT token generation
  - Session tracking

- **User Login**: POST `/api/auth/login`
  - Credentials validation
  - JWT token generation (30-day expiry)
  - Activity logging

- **Token Verification**: POST `/api/auth/verify`
  - JWT signature validation
  - Token expiry checking
  - User data retrieval

- **Current User**: GET `/api/auth/me`
  - Bearer token authentication
  - Profile information
  - Session details

#### System Endpoints
- **Health Check**: GET `/health`
  - Database connectivity test
  - Server status
  - Timestamp

#### Database Layer
- PostgreSQL connection pooling
- Query timeout handling (30s)
- Error logging
- Prepared statements (SQL injection prevention)

#### Security Features
- JWT authentication (HS256)
- bcrypt password hashing
- CORS configuration
- Helmet.js security headers
- Session management
- Activity logging

---

### ⏳ Pending Implementation

#### Posts Management
- Create post
- List user posts
- Update post
- Delete post
- Schedule post
- Media attachment

#### OAuth Integrations
- Facebook OAuth flow
- Facebook post publishing
- YouTube OAuth flow
- YouTube video upload
- TikTok OAuth flow
- TikTok video upload
- Token refresh handling

#### Media Uploads
- File upload endpoint (multer)
- Image processing
- Storage management
- CDN integration

#### AI Features
- Caption generation (Gemini/OpenAI)
- Hashtag suggestions
- Content analysis
- API key testing

#### Scheduled Tasks
- Cron job processor
- Post scheduling
- Auto-publishing
- Retry logic

---

## 🚀 Production Deployment

### Current Deployment

```yaml
Location: /opt/social-symphony/backend
Build Output: /opt/social-symphony/backend/dist
Process: PM2 (social-symphony-api)
Memory: 63MB
Status: Online
Uptime: Since deployment
Restarts: 0
```

### PM2 Configuration

```bash
# Start backend
pm2 start dist/index.js --name social-symphony-api

# Check status
pm2 status

# View logs
pm2 logs social-symphony-api

# Restart
pm2 restart social-symphony-api

# Monitor
pm2 monit
```

### Environment Configuration

```bash
# Location: /opt/social-symphony/backend/.env

# Database
DATABASE_URL=postgresql://social_app:***@localhost:5432/social_symphony

# JWT Configuration
JWT_SECRET=*** (64-character secret)
JWT_EXPIRES_IN=30d

# Encryption
ENCRYPTION_KEY=*** (64-character key for OAuth tokens)

# Server
PORT=3001
NODE_ENV=production

# OAuth (to be configured)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# AI APIs (to be configured)
GEMINI_API_KEY=
OPENAI_API_KEY=
```

---

## 🔧 Local Development

### Prerequisites

```bash
- Node.js 20+
- PostgreSQL 16+
- npm or yarn
```

### Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Setup database
createdb social_symphony
psql social_symphony < ../database-schema.sql

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Run development server
npm run dev
# Server runs on http://localhost:3001
```

### Build for Production

```bash
# Compile TypeScript
npm run build

# Output: dist/
```

---

## 📝 API Documentation

### Base URL
```
Production: https://socialautoupload.com/api
Local: http://localhost:3001/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}

Response (201):
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "createdAt": "2025-11-30T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "30d"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "30d"
}
```

#### 3. Verify Token
```http
POST /api/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response (200):
{
  "valid": true,
  "user": { ... }
}
```

#### 4. Get Current User
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "user",
  "profile": { ... }
}
```

### System Endpoints

#### Health Check
```http
GET /health

Response (200):
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-30T..."
}
```

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main entry point
│   ├── lib/
│   │   ├── database.ts       # ✅ PostgreSQL connection
│   │   ├── auth.ts           # ✅ Auth functions
│   │   └── encryption.ts     # ⏳ Token encryption
│   ├── routes/
│   │   ├── auth.ts           # ✅ Auth endpoints
│   │   ├── posts.ts          # ⏳ Posts CRUD
│   │   ├── channels.ts       # ⏳ Connected channels
│   │   ├── ai.ts             # ⏳ AI features
│   │   ├── scheduler.ts      # ⏳ Scheduled tasks
│   │   └── oauth/
│   │       ├── facebook.ts   # ⏳ Facebook OAuth
│   │       ├── youtube.ts    # ⏳ YouTube OAuth
│   │       └── tiktok.ts     # ⏳ TikTok OAuth
│   ├── middleware/
│   │   └── auth.ts           # ✅ JWT middleware
│   └── types/
│       └── index.ts          # TypeScript definitions
├── dist/                     # ✅ Build output
├── node_modules/
├── package.json
├── tsconfig.json
├── .env                      # ✅ Configured
└── README.md                 # This file
```

**Legend**:
- ✅ Implemented
- ⏳ Pending implementation

---

## 🔐 Security Implementation

### Password Hashing
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Hash password
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// Verify password
const isValid = await bcrypt.compare(password, hash);
```

### JWT Tokens
```typescript
import jwt from 'jsonwebtoken';

// Generate token
const token = jwt.sign(
  { userId, email, role },
  process.env.JWT_SECRET!,
  { expiresIn: '30d' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

### Database Queries
```typescript
// Always use parameterized queries
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs social-symphony-api

# Check database connection
sudo -u postgres psql -d social_symphony -c "SELECT 1;"

# Rebuild
npm run build

# Restart
pm2 restart social-symphony-api
```

### Database Connection Errors

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql postgresql://social_app:***@localhost:5432/social_symphony

# Check .env file
cat .env | grep DATABASE_URL
```

### Port Already in Use

```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>

# Restart backend
pm2 restart social-symphony-api
```

---

## 📊 Performance

### Current Metrics
```
Memory Usage: 63MB
Response Time: <50ms (local)
Database Queries: <10ms average
CPU Usage: <1%
```

### Optimization Tips
- Connection pooling configured (max 20)
- Query timeout set to 30s
- Parameterized queries for caching
- PM2 cluster mode ready

---

## 🔗 Related Documentation

- **Main README**: /opt/social-symphony/README.md
- **Deployment Guide**: /opt/social-symphony/DEPLOYMENT.md
- **Self-Hosting Guide**: /opt/social-symphony/SELF-HOSTING.md

---

**Version**: 1.0.0  
**Status**: Production (Partial)  
**Last Updated**: November 30, 2025
