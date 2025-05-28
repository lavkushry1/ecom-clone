# 🚀 Deployment Guide

## Overview
This guide covers the complete deployment process for the Flipkart Clone e-commerce application to Firebase.

## Prerequisites

### 1. Firebase CLI Setup
```bash
npm install -g firebase-tools
firebase login
```

### 2. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "flipkart-clone-production")
4. Enable Google Analytics (optional)
5. Create project

### 3. Enable Firebase Services
In your Firebase project console:
- **Authentication**: Enable Email/Password and Google providers
- **Firestore**: Create database in production mode
- **Storage**: Enable Firebase Storage
- **Hosting**: Enable Firebase Hosting
- **Functions**: Upgrade to Blaze plan (pay-as-you-go)

## Deployment Steps

### Step 1: Initialize Firebase
```bash
firebase init
```
Select:
- Firestore
- Functions
- Hosting
- Storage

### Step 2: Configure Environment
1. Copy environment template:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 3: Build and Test Locally
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test locally
npm run dev
```

### Step 4: Deploy Functions
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### Step 5: Deploy Firestore Rules and Storage
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

### Step 6: Seed Database (Optional)
```bash
npm run seed
```

### Step 7: Deploy to Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Step 8: Complete Deployment
```bash
# Deploy everything at once
npm run deploy
```

## Post-Deployment Configuration

### 1. Set Up Payment Gateway (Optional)
If using Razorpay for payments:
1. Create Razorpay account
2. Get API keys
3. Add to Firebase Functions environment:
```bash
firebase functions:config:set razorpay.key_id="your_key_id"
firebase functions:config:set razorpay.key_secret="your_key_secret"
```

### 2. Create Admin User
```bash
# Using the admin creation script
npm run create-admin
```

Or manually add to Firestore:
```javascript
// Add to /admins/{uid} collection
{
  email: "admin@yoursite.com",
  role: "super_admin",
  permissions: ["read", "write", "delete", "manage_users"],
  createdAt: new Date(),
  isActive: true
}
```

### 3. Configure Domain (Optional)
1. In Firebase Console → Hosting
2. Add custom domain
3. Follow DNS configuration steps

## Monitoring and Maintenance

### Firebase Console Monitoring
- **Functions**: Monitor function executions and errors
- **Firestore**: Check database usage and performance
- **Hosting**: Monitor traffic and performance
- **Authentication**: Track user registrations and logins

### Performance Monitoring
The app includes Firebase Performance Monitoring to track:
- Page load times
- API response times
- User interaction metrics

### Analytics
Firebase Analytics is configured to track:
- User behavior
- E-commerce events
- Custom events for business insights

## Environment URLs

### Development
- Frontend: http://localhost:3000
- Functions: http://localhost:5001
- Firestore UI: http://localhost:4000

### Production
- Frontend: https://your-project-id.web.app
- Functions: https://us-central1-your-project-id.cloudfunctions.net
- Console: https://console.firebase.google.com/project/your-project-id

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check all environment variables are set
   - Ensure Firebase project is properly configured
   - Run `npm run type-check` to catch TypeScript errors

2. **Functions Deployment Fails**
   - Verify Blaze plan is enabled
   - Check function memory and timeout settings
   - Review function logs in Firebase Console

3. **Authentication Issues**
   - Verify authorized domains in Firebase Console
   - Check authentication provider configuration
   - Ensure CORS settings are correct

4. **Database Permission Errors**
   - Review Firestore security rules
   - Check user authentication status
   - Verify admin permissions

### Support Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Firebase Support](https://firebase.google.com/support)

## Security Checklist

Before going live:
- [ ] Review and test Firestore security rules
- [ ] Configure proper CORS settings
- [ ] Enable Firebase Security Rules for Storage
- [ ] Set up proper authentication flows
- [ ] Test payment flows in sandbox mode
- [ ] Enable Firebase Security Monitoring
- [ ] Configure backup strategies
- [ ] Set up monitoring and alerting

## Backup Strategy

### Automated Backups
Firebase automatically backs up your data, but for critical applications:
1. Set up scheduled Cloud Functions for data export
2. Use Firebase Admin SDK to export data regularly
3. Store backups in Cloud Storage or external services

### Manual Backup
```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket/backups/$(date +%Y%m%d)
```

## Scaling Considerations

As your application grows:
- Monitor Firebase usage and costs
- Consider implementing caching strategies
- Optimize database queries and indexes
- Use Firebase Performance Monitoring to identify bottlenecks
- Consider CDN for static assets
