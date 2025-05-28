#!/bin/bash

# Firebase Deployment Script
# This script deploys the entire application to Firebase

echo "🚀 Starting Firebase deployment process..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
echo "🔐 Checking Firebase authentication..."
firebase login --interactive

# Build the Next.js application
echo "📦 Building Next.js application..."
npm run build

# Deploy Functions
echo "⚡ Deploying Firebase Functions..."
cd functions
npm run build
cd ..
firebase deploy --only functions

# Deploy Firestore rules and indexes
echo "🗄️ Deploying Firestore rules and indexes..."
firebase deploy --only firestore

# Deploy Storage rules
echo "💾 Deploying Storage rules..."
firebase deploy --only storage

# Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment completed successfully!"
echo "🌍 Your app is now live at: https://$(firebase use | grep 'Now using project' | cut -d' ' -f4).web.app"
echo ""
echo "📊 Post-deployment checklist:"
echo "□ Test user registration and login"
echo "□ Test product browsing and search"
echo "□ Test shopping cart and checkout"
echo "□ Test payment flow"
echo "□ Test admin dashboard"
echo "□ Check Firebase Analytics"
echo "□ Monitor Firebase Functions logs"
