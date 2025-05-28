#!/bin/bash

# Complete Setup Script for Flipkart Clone E-commerce App
# This script sets up the entire development environment

echo "🛍️ Flipkart Clone E-commerce Setup"
echo "===================================="
echo ""

# Check Node.js version
echo "📋 Checking system requirements..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing project dependencies..."
npm install

# Install Firebase CLI globally if not present
if ! command -v firebase &> /dev/null; then
    echo "⚡ Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Setup Firebase Functions
echo ""
echo "⚡ Setting up Firebase Functions..."
cd functions
npm install
npm run build
cd ..

# Check environment variables
echo ""
echo "🔧 Environment Configuration"
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your Firebase credentials"
    echo "   Follow FIREBASE_SETUP.md for detailed instructions"
else
    echo "✅ .env.local found"
fi

# Build the application
echo ""
echo "🏗️  Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check errors above."
    exit 1
fi

# Setup complete
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure Firebase project (see FIREBASE_SETUP.md)"
echo "2. Update .env.local with your Firebase credentials"
echo "3. Run 'npm run seed' to populate the database"
echo "4. Run 'npm run dev' to start development server"
echo "5. Run 'npm run deploy' when ready to deploy"
echo ""
echo "📚 Available Commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run seed         - Seed database with sample data"
echo "  npm run deploy       - Deploy to Firebase"
echo "  npm run functions    - Start Firebase Functions emulator"
echo ""
echo "🔗 Development URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Functions: http://localhost:5001"
echo "  Firestore: http://localhost:8080"
echo ""
echo "📖 Documentation:"
echo "  Setup Guide: SETUP_GUIDE.md"
echo "  Firebase Setup: FIREBASE_SETUP.md"
echo "  Implementation Tracker: IMPLEMENTATION_TRACKER.md"
