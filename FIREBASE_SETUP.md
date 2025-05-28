# Firebase Project Setup Guide

## 🔥 Setting Up Firebase Project

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `flipkart-clone-ecommerce`
4. Enable Google Analytics (optional)
5. Select analytics account or create new one

### 2. Enable Required Services

#### **Authentication**
1. Go to Authentication → Sign-in method
2. Enable providers:
   - Email/Password ✅
   - Phone ✅
   - Google ✅ (optional)
   - Anonymous ✅ (for guest checkout)

#### **Firestore Database**
1. Go to Firestore Database
2. Create database in production mode
3. Choose location closest to your users
4. Update security rules (see firestore.rules)

#### **Storage**
1. Go to Storage
2. Get started with default bucket
3. Update storage rules for product images

#### **Functions**
1. Go to Functions
2. Get started (for payment processing)

### 3. Get Configuration Keys

#### **Web App Configuration**
1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Click "Add app" → Web app
4. Register app name: `flipkart-clone-web`
5. Copy the configuration object

#### **Admin SDK Configuration**
1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract required fields for .env.local

### 4. Update Environment Variables

Replace the demo values in `.env.local` with your actual Firebase config:

```bash
# Firebase Configuration (Replace with your values)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (From service account JSON)
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key_here"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Configuration (Generate a secure random key)
ADMIN_SECRET_KEY=your_secure_admin_key_here
```

### 5. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

### 6. Test Configuration

Run the data seeder to populate initial data:

```bash
npm run seed-data
```

### 7. Deploy Firebase Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

## 🔒 Security Configuration

### Firestore Rules
The project includes production-ready security rules in `firestore.rules`:
- Users can only access their own data
- Admins have full access with secret key
- Products are publicly readable
- Orders are user-specific

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## 🚀 Production Deployment

### Firebase Hosting
1. Run production build: `npm run build`
2. Deploy to Firebase: `firebase deploy`
3. Your app will be available at: `https://your-project-id.web.app`

### Environment Variables for Production
Update `.env.production.local` with production URLs:

```bash
NEXT_PUBLIC_APP_URL=https://your-project-id.web.app
```

## 📱 Mobile App Setup (Optional)

Add iOS and Android apps in Firebase console for future mobile app development.

## 📊 Analytics Setup

Enable Google Analytics in Firebase console for user behavior tracking.

## 🔔 Push Notifications (Optional)

Configure Firebase Cloud Messaging for order updates and promotional notifications.
