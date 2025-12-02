# Changelog

All notable changes to Social Symphony will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-02

### Added
- **Social Media URL Downloads**: Support for 7 platforms (YouTube, TikTok, Facebook, Twitter, Instagram, Telegram)
  - yt-dlp v2025.11.12 integration for video extraction
  - Platform-specific format selection and optimization
  - Automatic metadata extraction (title, thumbnail, duration)
- **Enhanced Media Preview System**:
  - Dual-view layout: Visual grid preview + Text-based file list
  - Fullscreen media viewer with click-to-expand functionality
  - Hover effects showing "Full View" label
  - File info overlay (name, type, size) in fullscreen mode
- **Smart Video Processing**:
  - H.264 codec priority for 99% browser compatibility
  - Automatic AV1 to H.264 conversion using FFmpeg
  - Aspect ratio preservation (no cropping for 9:16 TikTok videos)
  - Object-contain display for proper video scaling
- **Improved UI/UX**:
  - Dark/Light theme toggle with system preference detection
  - Color-coded media icons (Blue for photos, Purple for videos)
  - Individual delete buttons (X icon) in text-based list
  - "Clear All" button for bulk deletion
  - Streamlined Preview panel (removed duplicate sections)
- **Backend Enhancements**:
  - Created `youtube-dl.ts` service for social media downloads
  - Added `upload-url.ts` route for URL-based media uploads
  - Nginx configuration for `/uploads/` static file serving
  - FFmpeg post-processing for video codec conversion

### Changed
- Updated yt-dlp from v2024.04.09 to v2025.11.12 (fixed Facebook extraction)
- Redesigned Preview section to eliminate redundancy
- Modified MediaUploader component to show upload controls only
- Improved video display with max-height constraints and black letterboxing
- Enhanced fullscreen modal for both photos and videos

### Fixed
- Facebook video download failures (outdated yt-dlp version)
- AV1 codec playback issues in browsers (Safari unsupported)
- 403 Forbidden errors on `/uploads/videos/` paths
- Video aspect ratio cropping (TikTok 9:16, head/feet cut off)
- Preview section showing media twice (grid + text list duplication)

### Technical Details
- **Video Format**: `bestvideo[vcodec^=avc1][height<=1080]+bestaudio/best`
- **FFmpeg Args**: `-c:v libx264 -preset fast -crf 23 -c:a aac`
- **Browser Support**: 99% (H.264 vs 60% AV1)
- **Platforms**: YouTube, TikTok, Twitter, Facebook, Instagram, Telegram, Direct URLs

### Security
- Added static file serving with proper permissions
- Configured Access-Control-Allow-Origin for uploads directory
- Maintained encryption for API tokens and keys

---

## [1.0.0] - 2025-11-30

### Initial Production Release

#### Core Features
- Multi-platform social media publishing (Facebook, YouTube, TikTok, Instagram, Twitter, LinkedIn)
- AI-powered caption generation (Gemini Pro / GPT-4)
- AI hashtag suggestions with configurable counts
- Scheduled posts with auto-publisher (PM2 service)
- Queue system for post management
- Real-time analytics dashboard
- Activity logging and audit trail

#### Backend
- Node.js 20.19.6 + Express.js + TypeScript
- PostgreSQL 16 database with 9 tables
- JWT authentication (30-day expiration)
- bcrypt password hashing (10 rounds)
- PM2 process manager with auto-restart
- Health check endpoint
- Structured logging with Morgan

#### Frontend
- React 18.3 + TypeScript + Vite
- shadcn-ui + Tailwind CSS
- TanStack Query for state management
- React Router v6 for navigation
- Responsive design with mobile support
- Dark theme ready (implemented Dec 2)

#### Infrastructure
- Ubuntu 24.04.3 LTS on Hetzner Cloud VPS
- Nginx 1.24.0 web server
- Let's Encrypt SSL (ECDSA certificate)
- Cloudflare DNS + CDN + DDoS protection
- UFW firewall + Fail2ban security
- 100% self-hosted (zero cloud dependencies)

#### Security
- HTTPS with TLS 1.2/1.3
- JWT token-based authentication
- Encrypted API key storage
- SQL injection protection (parameterized queries)
- XSS protection headers
- CORS configuration
- Origin IP hidden via Cloudflare

#### Database Schema
- users, profiles, sessions (authentication)
- posts, connected_channels, post_results (social media)
- media_uploads (file management)
- api_keys (third-party integrations)
- activity_logs (audit trail)

---

## Version History

- **v1.1.0** (2025-12-02): Social media URL support, enhanced preview system, video processing
- **v1.0.0** (2025-11-30): Initial production release

---

## Upgrade Guide

### From v1.0.0 to v1.1.0

#### Backend Updates
```bash
cd /var/www/socialautoupload.com/project/backend

# Install yt-dlp
pip3 install --break-system-packages -U yt-dlp

# Verify version
yt-dlp --version  # Should show 2025.11.12 or later

# Install FFmpeg (if not already installed)
sudo apt install ffmpeg

# Restart backend
pm2 restart social-symphony-api
```

#### Nginx Configuration
```bash
# Add to /etc/nginx/sites-available/socialautoupload.com
location /uploads/ {
    alias /opt/social-symphony/uploads/;
    expires 30d;
    add_header Access-Control-Allow-Origin "*";
    add_header Cache-Control "public, immutable";
}

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### Frontend Updates
```bash
cd /var/www/socialautoupload.com/project

# Pull latest changes
git pull origin master

# Install dependencies (if any new)
npm install

# Rebuild
npm run build

# Deploy
sudo cp -r dist/* /var/www/socialautoupload.com/html/
```

#### File Permissions
```bash
# Ensure uploads directory has correct permissions
sudo chown -R www-data:www-data /opt/social-symphony/uploads/
sudo chmod -R 755 /opt/social-symphony/uploads/
```

---

## Known Issues

### v1.1.0
- OAuth connections UI pending (backend ready, frontend WIP)
- Instagram video downloads limited (public posts only)
- Rate limiting not yet implemented

### v1.0.0
- OAuth flow not fully implemented
- Email notifications pending
- Database backups manual

---

## Roadmap

### v1.2.0 (Planned)
- [ ] Complete OAuth UI for all platforms
- [ ] Instagram Graph API integration
- [ ] Twitter API v2 integration
- [ ] Rate limiting implementation
- [ ] Redis caching layer

### v1.3.0 (Future)
- [ ] Email notifications
- [ ] Automated database backups
- [ ] Caption templates library
- [ ] Post duplication feature
- [ ] Bulk import from CSV/Excel

### v2.0.0 (Future)
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Custom branding (white-label)
- [ ] Advanced analytics with AI insights
- [ ] Multi-language support (မြန်မာ, English, etc.)

---

**Maintained by**: deskhei9-bot  
**Repository**: https://github.com/deskhei9-bot/socialAll  
**Production**: https://socialautoupload.com
