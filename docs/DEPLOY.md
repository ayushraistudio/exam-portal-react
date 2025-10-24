# Deployment Guide

This guide provides step-by-step instructions for deploying the MCQ Competition Portal to production.

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Docker and Docker Compose (for containerized deployment)
- Git installed
- Firebase project created

## Quick Deploy to Firebase

### 1. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select the following features:
# - Firestore
# - Functions
# - Hosting
# - Emulators (for development)
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env with your Firebase project details
nano .env
```

Required environment variables:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 4. Build Applications

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build
```

### 5. Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 6. Seed Initial Data

```bash
# Run the seed script to create admin and sample users
npm run seed
```

## Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Development environment
docker-compose up -d

# Production environment
docker-compose --profile production up -d
```

### 2. Individual Container Deployment

```bash
# Build frontend
docker build -f infra/Dockerfile.frontend -t mcq-frontend ./frontend

# Build backend
docker build -f infra/Dockerfile.backend -t mcq-backend ./backend

# Run containers
docker run -d -p 80:80 mcq-frontend
docker run -d -p 5001:5001 mcq-backend
```

## Environment-Specific Deployments

### Staging Environment

```bash
# Set staging project
firebase use staging-project-id

# Deploy to staging
firebase deploy --project staging-project-id

# Or use environment variables
FIREBASE_PROJECT_ID=staging-project-id firebase deploy
```

### Production Environment

```bash
# Set production project
firebase use production-project-id

# Deploy to production
firebase deploy --project production-project-id
```

## CI/CD Deployment

The project includes GitHub Actions workflows for automated deployment:

### 1. Setup GitHub Secrets

Add the following secrets to your GitHub repository:

- `FIREBASE_SERVICE_ACCOUNT_STAGING`: Service account JSON for staging
- `FIREBASE_SERVICE_ACCOUNT_PROD`: Service account JSON for production
- `FIREBASE_PROJECT_ID_STAGING`: Staging project ID
- `FIREBASE_PROJECT_ID_PROD`: Production project ID

### 2. Automatic Deployment

- **Staging**: Deploys automatically when pushing to `develop` branch
- **Production**: Deploys automatically when pushing to `main` branch

### 3. Manual Deployment

```bash
# Trigger deployment via GitHub Actions
gh workflow run ci.yml
```

## Post-Deployment Setup

### 1. Configure Authentication

1. Go to Firebase Console → Authentication
2. Enable Email/Password authentication
3. Configure authorized domains
4. Set up custom claims for admin users

### 2. Configure Firestore Security Rules

The security rules are automatically deployed, but verify they're active:

```bash
# Check deployed rules
firebase firestore:rules:get
```

### 3. Set up Monitoring

1. Enable Firebase Performance Monitoring
2. Set up Firebase Crashlytics
3. Configure Firebase Analytics
4. Set up Cloud Monitoring alerts

### 4. Configure Custom Domain (Optional)

```bash
# Add custom domain to Firebase Hosting
firebase hosting:channel:deploy live --only hosting
```

## Health Checks

### 1. Application Health

```bash
# Check frontend
curl https://your-domain.com/health

# Check backend
curl https://your-functions-url/health
```

### 2. Database Health

```bash
# Check Firestore connectivity
firebase firestore:indexes
```

### 3. Authentication Health

```bash
# Test authentication
firebase auth:export users.json
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Firebase Authentication Issues**
   ```bash
   # Re-authenticate
   firebase logout
   firebase login
   ```

3. **Function Deployment Failures**
   ```bash
   # Check function logs
   firebase functions:log
   ```

4. **Firestore Rules Issues**
   ```bash
   # Test rules locally
   firebase emulators:start --only firestore
   ```

### Logs and Monitoring

```bash
# View function logs
firebase functions:log --only your-function-name

# View hosting logs
firebase hosting:channel:list

# Monitor performance
firebase performance:monitoring
```

## Security Checklist

- [ ] Environment variables are properly set
- [ ] Firebase security rules are deployed
- [ ] HTTPS is enabled
- [ ] Authentication is configured
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] Error handling is implemented
- [ ] Logging is configured
- [ ] Monitoring is set up

## Performance Optimization

### 1. Frontend Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize images
- Enable caching headers

### 2. Backend Optimization

- Use connection pooling
- Implement caching
- Optimize database queries
- Use Cloud Functions scaling
- Monitor function performance

### 3. Database Optimization

- Create proper indexes
- Use pagination for large datasets
- Implement data archiving
- Monitor query performance

## Backup and Recovery

### 1. Database Backup

```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket

# Schedule regular backups
gcloud scheduler jobs create http backup-job \
  --schedule="0 2 * * *" \
  --uri="https://your-backup-function-url"
```

### 2. Configuration Backup

```bash
# Backup Firebase configuration
firebase projects:list > firebase-projects-backup.txt
firebase use --add > firebase-config-backup.txt
```

## Scaling Considerations

### 1. Horizontal Scaling

- Use Firebase Hosting CDN
- Implement Cloud Functions auto-scaling
- Use Firestore sharding for large datasets
- Implement Redis for session storage

### 2. Vertical Scaling

- Upgrade Firebase plan as needed
- Monitor resource usage
- Optimize function memory allocation
- Use Cloud SQL for complex queries

## Maintenance

### 1. Regular Updates

```bash
# Update dependencies
npm update

# Update Firebase CLI
npm install -g firebase-tools@latest

# Update Docker images
docker-compose pull
```

### 2. Security Updates

- Monitor security advisories
- Update dependencies regularly
- Review and update security rules
- Conduct security audits

### 3. Performance Monitoring

- Monitor application performance
- Review error logs
- Optimize slow queries
- Update indexes as needed
