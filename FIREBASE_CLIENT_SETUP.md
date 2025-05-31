# 🔑 Firebase Client Credentials Setup

## Current Status
✅ **Admin SDK configured** - Server-side credentials are ready  
⚠️ **Client SDK needs configuration** - You need to get the web app credentials

## Next Steps to Complete Setup

### 1. Get Firebase Web App Credentials

1. **Go to Firebase Console**: https://console.firebase.google.com/project/elite-matter-460118-d1
2. **Click on Project Settings** (gear icon)
3. **Scroll down to "Your apps" section**
4. **If you don't see a web app, click "Add app" → Web (</>) icon**
5. **Register your app** with name "Flipkart Clone"
6. **Copy the config object** that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "elite-matter-460118-d1.firebaseapp.com",
  projectId: "elite-matter-460118-d1",
  storageBucket: "elite-matter-460118-d1.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345"
};
```

### 2. Update .env.local

Replace these values in your `.env.local` file:

```bash
# Update these with your actual values from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...  # From apiKey
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012  # From messagingSenderId  
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012345  # From appId
```

### 3. Enable Authentication Methods

1. **Go to Authentication** in Firebase Console
2. **Click "Sign-in method" tab**
3. **Enable these providers**:
   - ✅ Email/Password
   - ✅ Google (optional but recommended)

### 4. Set up Firestore Database

1. **Go to Firestore Database**
2. **Click "Create database"**
3. **Choose "Start in test mode"** (we'll deploy rules later)
4. **Select your preferred location**

### 5. Set up Firebase Storage

1. **Go to Storage** in Firebase Console
2. **Click "Get started"**
3. **Choose "Start in test mode"**
4. **Use same location as Firestore**

### 6. Deploy Security Rules

Once you have the credentials, run:

```bash
# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage
```

### 7. Seed the Database

```bash
# Populate with sample data
npm run seed
```

## What's Already Configured

✅ **Firebase Admin SDK** - Server-side operations ready  
✅ **Security Rules** - Comprehensive Firestore and Storage rules  
✅ **Functions** - Payment and order processing functions ready  
✅ **Application Code** - All components and pages complete  

## After Getting Credentials

Once you update the `.env.local` file with your actual Firebase web app credentials:

1. **Restart the development server**:
   ```bash
   npm run dev
   ```

2. **Test the application**:
   - Visit http://localhost:3001
   - Try user registration/login
   - Test product browsing
   - Test cart and checkout

3. **Deploy to production**:
   ```bash
   npm run deploy
   ```

## Current .env.local Status

Your file currently has:
- ✅ Correct project ID: `elite-matter-460118-d1`
- ✅ Correct admin credentials
- ⚠️ Placeholder web app credentials (need real values)

## Need Help?

If you need assistance getting the Firebase web app credentials:
1. Share the Firebase config object from your console
2. I'll help update the .env.local file with the correct values

The application is ready to run as soon as you get the missing `apiKey`, `messagingSenderId`, and `appId` from your Firebase project console!
