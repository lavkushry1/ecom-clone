# 🚀 Flipkart Clone - Setup Guide

This guide will help you set up the complete Flipkart clone e-commerce application with Firebase integration.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Google account for Firebase

## 🔧 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Project Setup

#### Option A: Use Demo Mode (Recommended for Testing)
The project is preconfigured with demo Firebase settings. Simply run:
```bash
npm run dev
```

#### Option B: Set Up Real Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "flipkart-clone" (or your preferred name)
3. Enable the following services:
   - **Firestore Database** (start in test mode for now)
   - **Authentication** (enable Email/Password and Google providers)
   - **Storage** (for product images)
   - **Hosting** (for deployment)

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click "Web app"
   - Copy the configuration object

5. Update environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Firebase configuration values.

### 3. Initialize Sample Data
Visit the admin dashboard at `/admin` and click "Seed All Data" to populate your store with sample products.

## 🎯 Features Available

### ✅ Completed Features
- **Product Catalog**: Browse products by category, search, and filter
- **Shopping Cart**: Add/remove items, quantity management
- **Guest Checkout**: Complete purchases without registration
- **User Authentication**: Email/password and Google authentication
- **User Profiles**: Manage addresses, view order history
- **Payment Integration**: UPI QR codes and credit card simulation
- **Admin Dashboard**: Product management and analytics
- **Responsive Design**: Mobile-first responsive layout

### 🔄 Demo Features
- **Sample Products**: 10 curated products across categories
- **Mock Payments**: Simulated UPI and credit card processing
- **Order Tracking**: Demo order status updates
- **Search**: Client-side product search functionality

## 📱 Application Structure

```
/                    - Homepage with hero banner and featured products
/products           - Product catalog with search and filters
/products/[id]      - Individual product details
/category/[category] - Category-specific product listings
/search             - Search results page
/cart               - Shopping cart management
/checkout           - Guest checkout flow
/auth               - Login/register pages
/profile            - User account management
/orders/[orderId]   - Order tracking and details
/admin              - Administrative dashboard
```

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚀 Deployment

### Firebase Hosting
1. Build the project:
   ```bash
   npm run build
   npm run export
   ```

2. Deploy to Firebase:
   ```bash
   firebase login
   firebase init hosting
   firebase deploy
   ```

## 🔐 Security Configuration

### Firestore Rules
The project includes production-ready Firestore security rules in `firestore.rules`. Key features:
- Users can only access their own data
- Products are read-only for regular users
- Admin operations require authentication
- Guest checkout is supported with temporary user creation

### Authentication
- Email/password authentication
- Google OAuth integration
- Automatic user profile creation
- Guest user support for checkout

## 💳 Payment Integration

### UPI Payments
- QR code generation for UPI payments
- Real UPI ID integration ready
- Payment verification simulation

### Credit Cards
- Card form validation
- Secure input handling
- Payment processing simulation
- Integration-ready for payment gateways

## 📊 Admin Features

### Dashboard Analytics
- Sales overview and statistics
- Product performance tracking
- Order management system
- Customer insights

### Product Management
- Add/edit/delete products
- Category management
- Inventory tracking
- Bulk operations

## 🎨 Customization

### Brand Colors
The app uses Flipkart's brand colors defined in `tailwind.config.js`:
- Primary Blue: `#2874f0`
- Yellow: `#ff9f00`

### Component Customization
All UI components are built with Tailwind CSS and can be easily customized in the `/src/components` directory.

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify your Firebase configuration in `.env.local`
   - Ensure Firestore is enabled in your Firebase project

2. **Build Errors**
   - Run `npm run type-check` to identify TypeScript issues
   - Clear `.next` folder and reinstall dependencies

3. **Authentication Issues**
   - Verify authentication providers are enabled in Firebase Console
   - Check that redirect URLs are configured correctly

## 📚 Further Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com)

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Implementing real payment gateway integration
- Adding comprehensive error handling
- Setting up proper analytics
- Implementing advanced search with Algolia
- Adding email notifications
- Setting up CI/CD pipelines

---

**Happy Coding! 🚀**
