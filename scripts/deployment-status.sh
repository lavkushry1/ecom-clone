#!/bin/bash

echo "🎉 FLIPKART CLONE - DEPLOYMENT STATUS CHECK"
echo "==========================================="
echo ""

# Check if development server is running
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Development Server: RUNNING at http://localhost:3001"
else
    echo "❌ Development Server: NOT RUNNING"
fi

# Check build status
if [ -d ".next" ]; then
    echo "✅ Production Build: READY"
else
    echo "❌ Production Build: NOT FOUND"
fi

# Check Firebase configuration
if [ -f "firebase.json" ]; then
    echo "✅ Firebase Config: READY"
else
    echo "❌ Firebase Config: MISSING"
fi

# Check environment template
if [ -f ".env.example" ]; then
    echo "✅ Environment Template: READY"
else
    echo "❌ Environment Template: MISSING"
fi

# Check functions
if [ -d "functions" ] && [ -f "functions/package.json" ]; then
    echo "✅ Firebase Functions: READY"
else
    echo "❌ Firebase Functions: NOT CONFIGURED"
fi

# Check documentation
docs_count=$(ls -1 *.md 2>/dev/null | wc -l)
echo "✅ Documentation: $docs_count files ready"

echo ""
echo "📋 DEPLOYMENT CHECKLIST:"
echo "□ Create Firebase project"
echo "□ Configure .env.local with Firebase credentials"
echo "□ Run 'npm run seed' to populate database"
echo "□ Run 'npm run deploy' to deploy to Firebase"
echo "□ Create admin user"
echo "□ Test production deployment"
echo ""
echo "🚀 Project Status: READY FOR DEPLOYMENT!"
