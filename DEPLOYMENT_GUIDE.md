# 🚀 Social Symphony - Deployment Guide

## 📁 Project Structure (Updated - Best Practice)

သင့် project အားလုံး `/var/www/socialautoupload.com/` အောက်မှာ စုစည်းထားပါပြီ:

```
/var/www/socialautoupload.com/
├── project/        (333MB) - Source code & development files
├── html/          (1.1MB) - Production built files (nginx serves this)
├── logs/                  - Nginx access & error logs
└── backups/               - Deployment backups (auto-generated)
```

**အဓိက အပြောင်းအလဲ:**
- ✅ Project တစ်ခုလုံးကို `/var/www/` အောက်မှာ စုထားပါပြီ (Linux best practice)
- ✅ `/opt/social-symphony` ကို ဖျက်နိုင်ပါပြီ (အဟောင်း location)
- ✅ ပိုမို organized ဖြစ်ပါပြီ

## 🔄 Deployment Process

### Quick Deploy (အသုံးပြုရလွယ်ဆုံး)

```bash
cd /var/www/socialautoupload.com/project
./deploy.sh
```

### Manual Deploy

```bash
# 1. Navigate to project
cd /var/www/socialautoupload.com/project

# 2. Build the project
npm run build

# 3. Deploy to production
rsync -av --delete dist/ /var/www/socialautoupload.com/html/

# 4. Set permissions
chown -R www-data:www-data /var/www/socialautoupload.com/html/

# 5. Reload nginx
systemctl reload nginx
```

## 🛠️ Development Workflow

### 1. Code Changes လုပ်ချင်ရင်

```bash
cd /var/www/socialautoupload.com/project
# Edit your files in src/
```

### 2. Local Development Server

```bash
cd /var/www/socialautoupload.com/project
npm run dev
# Opens at http://localhost:8080
```

### 3. Build & Deploy to Production

```bash
cd /var/www/socialautoupload.com/project
./deploy.sh
```

## 📂 File Locations

| လမ်းကြောင်း | ရည်ရွယ်ချက် |
|------------|-------------|
| `/var/www/socialautoupload.com/project` | Development (main workspace - edit here!) |
| `/var/www/socialautoupload.com/project/src` | Source code |
| `/var/www/socialautoupload.com/project/dist` | Built files (auto-generated) |
| `/var/www/socialautoupload.com/html` | Production (nginx serves this) |
| `/var/www/socialautoupload.com/logs` | Nginx logs |
| `/var/www/socialautoupload.com/backups` | Deployment backups |
| `/var/www/socialautoupload.com/project/uploads` | User uploaded files |

## 🔍 Nginx Configuration

Nginx config: `/etc/nginx/sites-enabled/socialautoupload.com`

- **Frontend**: `/var/www/socialautoupload.com/html`
- **API**: Proxied to `localhost:3001`
- **Uploads**: Aliased to `/var/www/socialautoupload.com/project/uploads`

## ✅ Verification

Deploy ပြီးတဲ့အခါ verify လုပ်ပါ:

```bash
# Check deployed files
ls -lh /var/www/socialautoupload.com/html/

# Check nginx status
systemctl status nginx

# Check nginx logs
tail -f /var/www/socialautoupload.com/logs/access.log
tail -f /var/www/socialautoupload.com/logs/error.log

# Test website
curl -I https://socialautoupload.com
```

## 🔄 Backend API

Backend API က `/var/www/socialautoupload.com/project/backend` မှာ ရှိပါတယ်။

```bash
# Start backend (if not running)
cd /var/www/socialautoupload.com/project/backend
npm install
npm run dev  # Development
# or
npm start    # Production
```

Backend က port 3001 မှာ run ရပါမယ်။

## 📝 Important Notes

1. **All development work in `/var/www/socialautoupload.com/project`** - အဲ့ဒီမှာပဲ code edit လုပ်ပါ
2. **Never edit files in `/var/www/socialautoupload.com/html` directly** - deployment က overwrite လုပ်မှာပါ
3. **Use `./deploy.sh`** - Automated deployment with backups
4. **Backups** are saved in `/var/www/socialautoupload.com/backups` (keeps last 5)
5. **Old location `/opt/social-symphony` can be deleted** - project ကို ရွှေ့ပြီးပါပြီ

## 🎯 Common Tasks

### Update Dependencies

```bash
cd /var/www/socialautoupload.com/project
npm install [package-name]
npm run build
./deploy.sh
```

### Rollback Deployment

```bash
# List backups
ls -lt /var/www/socialautoupload.com/backups/

# Restore from backup
rsync -av /var/www/socialautoupload.com/backups/backup_YYYYMMDD_HHMMSS/ /var/www/socialautoupload.com/html/
systemctl reload nginx
```

### Clear Build Cache

```bash
cd /var/www/socialautoupload.com/project
rm -rf dist node_modules/.vite
npm run build
./deploy.sh
```

## 🌐 URLs

- **Production**: https://socialautoupload.com
- **API**: https://socialautoupload.com/api
- **Uploads**: https://socialautoupload.com/uploads

## 🔐 Environment Variables

Edit `/var/www/socialautoupload.com/project/.env` for configuration:

- `VITE_API_URL`: Backend API URL
- `VITE_APP_NAME`: Application name
- `VITE_APP_URL`: Production URL

**After changing .env, rebuild:**
```bash
cd /var/www/socialautoupload.com/project
npm run build
./deploy.sh
```
