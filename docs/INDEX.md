# Social Symphony Documentation Index

**Last Updated**: February 2, 2026  
**Version**: 1.0.0

Welcome to the Social Symphony documentation! This guide will help you navigate through all available documentation.

---

## 📚 Documentation Structure

### For Users
- **[Quick Start Guide](./QUICK_START.md)** - Get started in 5 minutes
- **[Publishing Profiles Guide](../PUBLISHING_PROFILES_GUIDE.md)** - How to manage multiple accounts
- **[Content Types Guide](../CONTENT_TYPES_GUIDE.md)** - Supported content types per platform
- **[Content Types Guide (မြန်မာ)](../CONTENT_TYPES_GUIDE_MM.md)** - Myanmar language guide

### For Developers
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete REST API reference
- **[OAuth Setup Guide](./OAUTH_SETUP.md)** - Social media OAuth integration
- **[Backend README](../backend/README.md)** - Backend architecture and setup
- **[Deployment Guide](../DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Self-Hosting Guide](../SELF-HOSTING.md)** - Self-hosting instructions

### Platform-Specific Guides
- **[Pinterest Integration](./PINTEREST_GUIDE.md)** - Pinterest OAuth and API usage
- **[Publishing Profiles Design](./PUBLISHING_PROFILES_DESIGN.md)** - Architecture documentation

### Project Information
- **[Main README](../README.md)** - Project overview and features
- **[README (မြန်မာ)](../README_MM.md)** - Myanmar language overview
- **[Changelog](../CHANGELOG.md)** - Version history and updates
- **[Project Roadmap](../PROJECT_ROADMAP.md)** - Future development plans

---

## 🚀 Quick Navigation by Task

### I want to...

#### Install and Run the Project
1. Read [Quick Start Guide](./QUICK_START.md)
2. Follow [Deployment Guide](../DEPLOYMENT_GUIDE.md) for production
3. Check [Self-Hosting Guide](../SELF-HOSTING.md) for your own server

#### Connect Social Media Accounts
1. Read [OAuth Setup Guide](./OAUTH_SETUP.md)
2. Check platform-specific sections in [API Documentation](./API_DOCUMENTATION.md)
3. For Pinterest: [Pinterest Guide](./PINTEREST_GUIDE.md)

#### Develop New Features
1. Start with [Backend README](../backend/README.md)
2. Review [API Documentation](./API_DOCUMENTATION.md)
3. Check [Project Roadmap](../PROJECT_ROADMAP.md) for planned features

#### Understand the Codebase
1. Read [Main README](../README.md) for architecture overview
2. Check [Backend README](../backend/README.md) for server details
3. Review [API Documentation](./API_DOCUMENTATION.md) for endpoints

#### Publish Content
1. Read [Content Types Guide](../CONTENT_TYPES_GUIDE.md)
2. Check [Publishing Profiles Guide](../PUBLISHING_PROFILES_GUIDE.md)
3. See [Quick Start Guide](./QUICK_START.md) for examples

---

## 📖 Documentation by Category

### Getting Started
| Document | Description | Target Audience |
|----------|-------------|-----------------|
| [Quick Start](./QUICK_START.md) | 5-minute setup guide | All users |
| [Main README](../README.md) | Project overview | All users |
| [Deployment Guide](../DEPLOYMENT_GUIDE.md) | Production setup | DevOps/Admins |

### API & Integration
| Document | Description | Target Audience |
|----------|-------------|-----------------|
| [API Documentation](./API_DOCUMENTATION.md) | Complete REST API reference | Developers |
| [OAuth Setup](./OAUTH_SETUP.md) | Social media authentication | Developers |
| [Backend README](../backend/README.md) | Backend architecture | Developers |

### User Guides
| Document | Description | Target Audience |
|----------|-------------|-----------------|
| [Content Types Guide](../CONTENT_TYPES_GUIDE.md) | Platform post types | Content creators |
| [Publishing Profiles](../PUBLISHING_PROFILES_GUIDE.md) | Multi-account management | Users |

### Myanmar Language
| Document | Description |
|----------|-------------|
| [README_MM.md](../README_MM.md) | Project overview in Myanmar |
| [CONTENT_TYPES_GUIDE_MM.md](../CONTENT_TYPES_GUIDE_MM.md) | Content types guide in Myanmar |
| [PUBLISHING_PROFILES_GUIDE_MM.md](../PUBLISHING_PROFILES_GUIDE_MM.md) | Publishing profiles in Myanmar |

---

## 🔧 Technical Documentation

### Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js 20 + Express + TypeScript + PM2
- **Database**: PostgreSQL 16
- **Web Server**: Nginx 1.24
- **Infrastructure**: Ubuntu 24.04 LTS

### Key Directories
```
project/
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   └── config/   # Configuration
│   └── README.md     # Backend docs
├── src/              # React frontend
├── docs/             # Documentation (you are here)
├── uploads/          # User media files
└── README.md         # Main documentation
```

---

## 📱 Supported Platforms

| Platform | Status | OAuth | Post Types | Analytics |
|----------|--------|-------|-----------|-----------|
| **Facebook** | ✅ Ready | ⏳ Pending | Text, Photo, Video, Reel, Album | ✅ Yes |
| **YouTube** | ✅ Ready | ⏳ Pending | Video, Short | ✅ Yes |
| **TikTok** | ✅ Ready | ⏳ Pending | Video | ✅ Yes |
| **Instagram** | ✅ Ready | ⏳ Pending | Photo, Video, Reel | ✅ Yes |
| **Twitter** | ✅ Ready | ⏳ Pending | Text, Media | ✅ Yes |
| **LinkedIn** | ✅ Ready | ⏳ Pending | Text, Image | ✅ Yes |
| **Pinterest** | ✅ Live | ✅ Working | Image, Pin | ✅ Yes |

---

## 🆘 Need Help?

### For Users
- Check [Quick Start Guide](./QUICK_START.md) for basic setup
- Read [Content Types Guide](../CONTENT_TYPES_GUIDE.md) for posting help
- Myanmar speakers: See [README_MM.md](../README_MM.md)

### For Developers
- Review [API Documentation](./API_DOCUMENTATION.md)
- Check [Backend README](../backend/README.md)
- See [Project Roadmap](../PROJECT_ROADMAP.md) for future plans

### For System Admins
- Follow [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- Read [Self-Hosting Guide](../SELF-HOSTING.md)
- Check [Secrets Documentation](../SECRETS.md) for environment variables

---

## 📝 Contributing

This is a production application. If you want to contribute:
1. Read the [Main README](../README.md) first
2. Check [Project Roadmap](../PROJECT_ROADMAP.md) for planned features
3. Review [API Documentation](./API_DOCUMENTATION.md) for endpoints
4. Set up your development environment using [Quick Start Guide](./QUICK_START.md)

---

## 📞 Contact & Support

- **Production URL**: https://socialautoupload.com
- **Status**: ✅ Live & Operational
- **Version**: 1.0.0
- **Last Updated**: February 2, 2026

---

**Happy Publishing! 🚀**
