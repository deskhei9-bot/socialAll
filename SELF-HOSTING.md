# Self-Hosting Guide (Complete Backend)

ဤ guide သည် Lovable Cloud အစား သင့်ကိုယ်ပိုင် VPS တွင် backend တစ်ခုလုံးကို self-host လုပ်နည်းကို ရှင်းပြထားပါသည်။

## Quick Start (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Generate keys
chmod +x scripts/*.sh
./scripts/generate-keys.sh

# 3. Configure environment
cp .env.complete.example .env
# Edit .env with generated keys

# 4. Start everything
./scripts/start.sh

# Access:
# - Frontend: http://localhost
# - Backend API: http://localhost:3001
# - Supabase API: http://localhost:8000
# - Studio (optional): http://localhost:3002
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        VPS Server                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Nginx     │  │  Frontend   │  │   Backend API       │  │
│  │  (Reverse   │──│  (React)    │  │   (Node.js/Express) │  │
│  │   Proxy)    │  │  Port 80    │  │   Port 3001         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                              │               │
│                                              ▼               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Self-Hosted Supabase                        ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  ││
│  │  │PostgreSQL│ │  Auth    │ │ Storage  │ │  Realtime  │  ││
│  │  │ Port 5432│ │Port 9999 │ │Port 5000 │ │ Port 4000  │  ││
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Option 1: Self-Hosted Supabase (Recommended)

### Prerequisites
- Docker & Docker Compose
- 4GB+ RAM
- 20GB+ Storage

### Step 1: Clone Supabase Docker

```bash
# Clone Supabase docker setup
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Copy environment file
cp .env.example .env
```

### Step 2: Configure Environment

Edit `.env` file:

```env
############
# Secrets - GENERATE NEW ONES!
############
POSTGRES_PASSWORD=your-super-secret-postgres-password
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=your-generated-anon-key
SERVICE_ROLE_KEY=your-generated-service-role-key

############
# Database
############
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432

############
# API
############
SITE_URL=http://your-domain.com
API_EXTERNAL_URL=http://your-domain.com:8000

############
# Auth
############
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true
```

### Step 3: Generate JWT Keys

```bash
# Generate ANON_KEY and SERVICE_ROLE_KEY
# Use https://supabase.com/docs/guides/self-hosting#api-keys
# Or use this Node.js script:

node -e "
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:', jwtSecret);

const anonPayload = {
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
};

const servicePayload = {
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
};

console.log('ANON_KEY:', jwt.sign(anonPayload, jwtSecret));
console.log('SERVICE_ROLE_KEY:', jwt.sign(servicePayload, jwtSecret));
"
```

### Step 4: Start Supabase

```bash
docker compose up -d
```

### Step 5: Run Database Migrations

Database schema များကို migrate လုပ်ရန်:

```bash
# Connect to PostgreSQL
docker exec -it supabase-db psql -U postgres

# Run migrations from supabase/migrations folder
# Copy each migration file content and execute
```

---

## Option 2: Standalone Backend API (Without Supabase)

### Project Structure

```
backend/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── posts.ts
│   │   ├── channels.ts
│   │   ├── oauth/
│   │   │   ├── facebook.ts
│   │   │   ├── youtube.ts
│   │   │   └── tiktok.ts
│   │   └── ai/
│   │       ├── caption.ts
│   │       └── hashtags.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── services/
│   │   ├── database.ts
│   │   └── storage.ts
│   └── utils/
│       └── encryption.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

---

## Frontend Configuration

### Update Environment Variables

Create `.env.production` for self-hosted backend:

```env
# For Self-Hosted Supabase
VITE_SUPABASE_URL=http://your-vps-ip:8000
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=default

# OR For Standalone Backend
VITE_API_URL=http://your-vps-ip:3001
```

### Conditional Client Setup

Frontend code ကို self-hosted အတွက် ပြင်ဆင်ရန်:

```typescript
// src/integrations/supabase/client.ts (for self-hosted)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

---

## Docker Compose (Complete Stack)

```yaml
# docker-compose.full.yml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=http://kong:8000
      - VITE_SUPABASE_PUBLISHABLE_KEY=${ANON_KEY}
    depends_on:
      - kong
    networks:
      - app-network

  # Supabase Kong API Gateway
  kong:
    image: kong:2.8.1
    ports:
      - "8000:8000"
      - "8443:8443"
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
    volumes:
      - ./volumes/api/kong.yml:/var/lib/kong/kong.yml:ro
    networks:
      - app-network

  # Supabase Auth
  auth:
    image: supabase/gotrue:v2.99.0
    ports:
      - "9999:9999"
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD}@db:5432/postgres
      GOTRUE_SITE_URL: ${SITE_URL}
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_JWT_EXP: 3600
      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_MAILER_AUTOCONFIRM: "true"
    depends_on:
      - db
    networks:
      - app-network

  # Supabase REST API
  rest:
    image: postgrest/postgrest:v11.2.0
    ports:
      - "3000:3000"
    environment:
      PGRST_DB_URI: postgres://postgres:${POSTGRES_PASSWORD}@db:5432/postgres
      PGRST_DB_SCHEMAS: public,storage
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
    networks:
      - app-network

  # Supabase Storage
  storage:
    image: supabase/storage-api:v0.40.4
    ports:
      - "5000:5000"
    environment:
      ANON_KEY: ${ANON_KEY}
      SERVICE_KEY: ${SERVICE_ROLE_KEY}
      POSTGREST_URL: http://rest:3000
      PGRST_JWT_SECRET: ${JWT_SECRET}
      DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD}@db:5432/postgres
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
    volumes:
      - ./volumes/storage:/var/lib/storage
    depends_on:
      - db
      - rest
    networks:
      - app-network

  # PostgreSQL Database
  db:
    image: supabase/postgres:15.1.0.117
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: postgres
    volumes:
      - ./volumes/db/data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
  storage-data:
```

---

## Migration Scripts

### Export Current Schema

```bash
# Create migrations folder
mkdir -p migrations

# Export schema (run this from Lovable Cloud connection)
# Or copy from supabase/migrations folder
```

### Database Initialization Script

```sql
-- migrations/001_init.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create connected_channels table
CREATE TABLE public.connected_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_handle TEXT,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'connected',
  followers_count INTEGER DEFAULT 0,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.posts(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  platform TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_results table
CREATE TABLE public.post_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id),
  channel_id UUID REFERENCES public.connected_channels(id),
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create caption_templates table
CREATE TABLE public.caption_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT DEFAULT '',
  hashtags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_api_keys table
CREATE TABLE public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider VARCHAR NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caption_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true);
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL password | `supersecretpassword` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-jwt-secret-here` |
| `ANON_KEY` | Anonymous API key | `eyJhbGciOiJIUzI1NiIs...` |
| `SERVICE_ROLE_KEY` | Service role key | `eyJhbGciOiJIUzI1NiIs...` |
| `SITE_URL` | Frontend URL | `https://your-domain.com` |
| `ENCRYPTION_KEY` | Token encryption key | `your-encryption-key` |
| `GOOGLE_CLIENT_ID` | YouTube OAuth | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | YouTube OAuth | `your-google-secret` |
| `FACEBOOK_APP_ID` | Facebook App ID | `123456789` |
| `FACEBOOK_APP_SECRET` | Facebook App Secret | `your-fb-secret` |
| `TIKTOK_CLIENT_KEY` | TikTok Client Key | `your-tiktok-key` |
| `TIKTOK_CLIENT_SECRET` | TikTok Client Secret | `your-tiktok-secret` |

---

## Quick Start Commands

```bash
# 1. Clone your project
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Create environment file
cp .env.example .env.local
# Edit .env.local with your values

# 3. Start full stack
docker-compose -f docker-compose.full.yml up -d

# 4. Run migrations
docker exec -it supabase-db psql -U postgres -f /docker-entrypoint-initdb.d/001_init.sql

# 5. Access your app
# Frontend: http://your-ip
# Supabase Studio: http://your-ip:3000
# API: http://your-ip:8000
```

---

## SSL/HTTPS Setup

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Troubleshooting

### Database Connection Issues
```bash
docker logs supabase-db
docker exec -it supabase-db psql -U postgres -c "\dt"
```

### Auth Issues
```bash
docker logs supabase-auth
curl http://localhost:9999/health
```

### Storage Issues
```bash
docker logs supabase-storage
ls -la ./volumes/storage
```

---

## Support

- [Supabase Self-Hosting Docs](https://supabase.com/docs/guides/self-hosting)
- [Docker Compose Reference](https://docs.docker.com/compose/)
