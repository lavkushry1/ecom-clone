#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Flipkart Clone - Project Setup');
console.log('================================\n');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envLocalPath)) {
  console.log('📝 Creating .env.local from .env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    // Read the example file and create demo .env.local
    const demoEnv = `# Firebase Configuration (Demo values for local development)
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flipkart-clone-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flipkart-clone-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flipkart-clone-demo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012345

# Firebase Admin SDK (Demo values)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@flipkart-clone-demo.iam.gserviceaccount.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Configuration
ADMIN_SECRET_KEY=demo-admin-secret-key`;

    fs.writeFileSync(envLocalPath, demoEnv);
    console.log('✅ Created .env.local with demo configuration');
  } else {
    console.log('⚠️  .env.example not found');
  }
} else {
  console.log('✅ .env.local already exists');
}

console.log('\n🎯 Setup Complete!');
console.log('\nNext steps:');
console.log('1. Run: npm run dev');
console.log('2. Visit: http://localhost:3000');
console.log('3. Go to /admin to seed sample data');
console.log('\n📚 For detailed setup instructions, see SETUP_GUIDE.md');

console.log('\n🛍️ Demo Features Available:');
console.log('• Product catalog with search and filtering');
console.log('• Shopping cart and guest checkout');
console.log('• User authentication (email/password & Google)');
console.log('• Payment simulation (UPI QR & Credit Cards)');
console.log('• Admin dashboard with data management');
console.log('• Order tracking and user profiles');

console.log('\n🔧 To set up a real Firebase project:');
console.log('1. Create a Firebase project at https://console.firebase.google.com/');
console.log('2. Enable Firestore, Authentication, and Hosting');
console.log('3. Update .env.local with your actual Firebase config');
console.log('4. Deploy: firebase deploy\n');
