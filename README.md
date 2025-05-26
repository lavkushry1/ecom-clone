# 🛒 Flipkart Clone - Complete E-commerce Platform

A full-featured e-commerce platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Shadcn/UI**, and **Firebase**. This Flipkart clone includes modern e-commerce features like product catalog, shopping cart, payment integration, user authentication, and admin dashboard.

## ✨ Features

### 🛍️ Customer Features
- **Product Catalog**: Browse products with advanced search and filtering
- **Shopping Cart**: Add/remove items with real-time quantity management
- **Wishlist**: Save favorite products for later
- **User Authentication**: Email/password and Google OAuth integration
- **Guest Checkout**: Complete purchases without registration
- **Payment Options**: UPI QR code and credit card payment simulation
- **Order Tracking**: Real-time order status updates
- **User Profile**: Manage addresses, view order history, account settings
- **Responsive Design**: Mobile-first, fully responsive layout

### 👨‍💼 Admin Features
- **Dashboard Analytics**: Orders, revenue, and user statistics
- **Product Management**: Add, edit, delete products with image upload
- **Order Management**: View and update order statuses
- **User Management**: View customer details and order history
- **Data Seeding**: Populate store with sample data for testing

### 🏗️ Technical Features
- **Next.js 14** with App Router for optimal performance
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for rapid UI development
- **Shadcn/UI** for beautiful, accessible components
- **Firebase** for backend services (Auth, Firestore, Storage)
- **Real-time Updates** for cart and order status
## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase CLI (optional, for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flipkart-clone.git
   cd flipkart-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   npm run setup
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

6. **Seed sample data** (Optional)
   - Go to `/admin` in your browser
   - Click "Seed All Data" to populate with sample products

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

### Backend & Services
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting (optional)

## 📱 Pages & Routes

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Homepage | Hero banner, categories, featured products |
| `/products` | Product catalog | Search, filters, pagination |
| `/products/[id]` | Product details | Images, specs, reviews, add to cart |
| `/search` | Search results | Advanced filtering and sorting |
| `/cart` | Shopping cart | Quantity management, price calculation |
| `/checkout` | Checkout flow | Guest checkout, payment options |
| `/auth` | Authentication | Login, register, Google OAuth |
| `/profile` | User profile | Order history, addresses, settings |
| `/admin` | Admin dashboard | Product management, analytics |

## 🔧 Configuration

### Environment Variables
The project includes a setup script that creates demo configuration automatically. For production, update `.env.local` with your Firebase configuration:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (for server-side operations)
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SECRET_KEY=your_admin_secret
```

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database
4. Set up Storage bucket
5. Update environment variables with your config

## 🚀 Deployment

### Firebase Hosting
```bash
# Build the project
npm run build

# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
firebase deploy
```

## 🧪 Testing & Demo

### Demo Features
The application includes demo mode for testing:
- **Sample Products**: 10 curated products with realistic data
- **Mock Payments**: Simulated payment processing
- **Demo Orders**: Test order flow without real transactions
- **Admin Dashboard**: Full product and order management

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Setup environment
npm run setup
```

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Component Documentation](docs/) - UI component reference
- [Firebase Services](src/lib/firebase/) - Backend service documentation

## 🎨 Customization

### Branding
- Update colors in `tailwind.config.js`
- Replace logo in `public/` directory
- Modify brand name in `layout.tsx`

### Adding Products
- Use the admin dashboard at `/admin`
- Or modify the data seeder in `lib/data-seeder.ts`

### Payment Integration
- Update payment components in `components/payment/`
- Integrate with actual payment providers (Stripe, Razorpay, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js, TypeScript, and Firebase**

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=
```
