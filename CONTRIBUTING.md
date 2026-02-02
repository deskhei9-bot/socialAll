# Contributing to Social Symphony

Thank you for your interest in contributing to Social Symphony! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 🤝 Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Git
- Basic knowledge of TypeScript, React, and Express.js

### Setup Development Environment

```bash
# 1. Fork and clone the repository
git clone https://github.com/deskhei9-bot/socialAll.git
cd socialAll

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Setup database
createdb social_symphony
psql social_symphony < database/schema.sql

# 4. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# 5. Start development servers
cd backend && npm run dev  # Backend: http://localhost:3001
cd .. && npm run dev       # Frontend: http://localhost:5173
```

---

## 💻 Development Workflow

### 1. Create a Branch
```bash
# For new features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/issue-description

# For documentation
git checkout -b docs/what-you-are-documenting
```

### 2. Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes
```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd .. && npm test

# Test the application manually
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature"
```

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
# Then create a Pull Request on GitHub
```

---

## 📝 Coding Standards

### TypeScript/JavaScript

```typescript
// Use TypeScript strict mode
// Use explicit types
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

// Use async/await instead of callbacks
async function fetchUser(id: string): Promise<User> {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

// Use meaningful variable names
const userEmail = user.email; // ✅ Good
const e = user.email;         // ❌ Bad
```

### React Components

```typescript
// Use functional components with TypeScript
interface PostCardProps {
  post: Post;
  onDelete: (id: string) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  // Component logic
}

// Use proper hooks
const [loading, setLoading] = useState(false);
const query = useQuery(['posts'], fetchPosts);
```

### CSS/Styling

```typescript
// Use Tailwind CSS classes
<div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800">
  <span className="text-sm font-medium">Content</span>
</div>

// For complex styles, use @apply in CSS
.custom-button {
  @apply px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600;
}
```

---

## 📦 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh when token expires.
Add refresh endpoint and update frontend auth logic.

Closes #123

---

fix(upload): resolve video codec compatibility issue

Convert AV1 videos to H.264 for better browser support.
Update FFmpeg processing pipeline.

Fixes #456

---

docs(readme): update installation instructions

Add prerequisites section and clarify setup steps.
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update Documentation**: If you changed functionality, update relevant docs
2. **Add Tests**: Ensure new features have tests
3. **Run Linter**: `npm run lint` (fix all errors)
4. **Build Successfully**: `npm run build` (no errors)
5. **Test Locally**: Verify everything works

### PR Title Format
```
feat(scope): add new feature
fix(scope): resolve bug
docs: update documentation
```

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step one
2. Step two
3. Expected result

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### Review Process

1. **Automated Checks**: CI/CD will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm run test:coverage      # Coverage report
```

### Manual Testing Checklist
- [ ] Authentication (login, register, logout)
- [ ] Post creation and scheduling
- [ ] Media upload
- [ ] AI tools (captions, hashtags)
- [ ] Analytics dashboard
- [ ] Dark/Light theme
- [ ] Mobile responsiveness

---

## 📚 Documentation

### What to Document

1. **Code Comments**: For complex logic
2. **API Endpoints**: Add to `docs/API_DOCUMENTATION.md`
3. **Features**: Update main `README.md`
4. **Guides**: Add tutorials to `docs/` folder

### Documentation Style

```typescript
/**
 * Generates AI-powered caption for social media post
 * 
 * @param topic - The topic or subject of the post
 * @param tone - The desired tone (professional, casual, etc.)
 * @param platform - Target platform (facebook, twitter, etc.)
 * @returns Promise<string> - Generated caption text
 * 
 * @example
 * const caption = await generateCaption('Product Launch', 'professional', 'linkedin');
 */
async function generateCaption(
  topic: string,
  tone: CaptionTone,
  platform: Platform
): Promise<string> {
  // Implementation
}
```

---

## 🎯 Areas for Contribution

### High Priority
- **OAuth Integration**: Facebook, YouTube, TikTok, Instagram, Twitter, LinkedIn
- **Email Notifications**: Send alerts for scheduled posts
- **Rate Limiting**: Protect API endpoints
- **Post Templates**: Reusable content templates

### Medium Priority
- **Advanced Analytics**: More detailed metrics
- **Team Collaboration**: Multi-user support
- **Bulk Import**: CSV/Excel upload
- **Post Duplication**: Clone existing posts

### Low Priority
- **Mobile App**: React Native version
- **Browser Extension**: Quick posting from browser
- **Zapier Integration**: Connect with other tools
- **WordPress Plugin**: Embed in WordPress

---

## 🐛 Reporting Bugs

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
Add screenshots if applicable

**Environment**
- OS: [e.g., Ubuntu 24.04]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution**
What you want to happen

**Describe alternatives**
Other solutions you've considered

**Additional context**
Mockups, examples, or other context
```

---

## 📞 Getting Help

- **Documentation**: Check [docs/INDEX.md](docs/INDEX.md)
- **Discussions**: GitHub Discussions (coming soon)
- **Issues**: GitHub Issues for bugs and features

---

## 🎉 Recognition

Contributors will be:
- Listed in the project README
- Credited in release notes
- Recognized in the community

Thank you for contributing to Social Symphony! 🚀

---

**Version**: 1.0.0  
**Last Updated**: February 2, 2026
