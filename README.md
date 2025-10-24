# 🎯 MCQ Competition Portal

A secure, real-time online MCQ competition platform with advanced anti-cheating measures.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Git

### Installation
```bash
# Install dependencies
npm install

# Frontend dependencies
cd frontend && npm install

# Backend dependencies
cd ../backend && npm install
```

### Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your Firebase config
```

### Start Development
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:5001
```

## 📱 Features

### For Administrators
- ✅ Create and manage student accounts
- ✅ Design contests with multiple questions
- ✅ Start/stop contests in real-time
- ✅ Monitor active sessions
- ✅ Approve/reject rejoin requests
- ✅ View detailed results and analytics

### For Students
- ✅ Secure exam environment
- ✅ Real-time timer and progress tracking
- ✅ Auto-save functionality
- ✅ Canvas-rendered questions with watermarks
- ✅ Rejoin request system

### Security Features
- 🔒 Canvas rendering prevents easy copying
- 🔒 Per-screen watermarking
- 🔒 Window/tab switch detection
- 🔒 Disabled right-click and keyboard shortcuts
- 🔒 Single session enforcement
- 🔒 Real-time activity monitoring

## 🔐 Authentication

The system uses Firebase Authentication for secure user management. Users must be created through the admin panel or Firebase console.

## 📁 Project Structure

```
mcq-competition-portal/
├── frontend/          # React application
├── backend/           # Firebase Cloud Functions
├── docs/              # Documentation
├── tests/             # Test suites
├── infra/             # Docker & deployment
└── scripts/           # Utilities
```

## 🔐 Security Notice

⚠️ **Important**: Web-based security measures cannot prevent all forms of cheating. For high-stakes exams, consider:
- Dedicated secure browsers
- Live proctoring
- Physical security measures

## 📚 Documentation

- [Deployment Guide](docs/DEPLOY.md)
- [Security Documentation](docs/SECURITY.md)
- [API Documentation](docs/API.md)
- [UI Wireframes](docs/WIREFRAMES.md)

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development servers
npm run build        # Build for production
npm run test         # Run all tests
npm run lint         # Lint code
npm run deploy       # Deploy to Firebase
```

### Testing
```bash
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
```

## 🚀 Deployment

### Firebase (Recommended)
```bash
firebase login
firebase init
firebase deploy
```

### Docker
```bash
docker-compose up -d
```

## 📞 Support

- 📧 Email: support@mcq-portal.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Docs: [Full Documentation](docs/)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for secure online education**