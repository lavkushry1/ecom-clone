// Firebase Data Seeder Script
// Run with: npm run seed-data

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  writeBatch,
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { config } from 'dotenv';

config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Firestore emulator already connected');
  }
}

// Sample data
const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets and electronic devices',
    image: '/images/categories/electronics.jpg',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Trending clothes and accessories',
    image: '/images/categories/fashion.jpg',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    description: 'Everything for your home and kitchen needs',
    image: '/images/categories/home-kitchen.jpg',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'books',
    name: 'Books',
    description: 'Wide collection of books and e-books',
    image: '/images/categories/books.jpg',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    description: 'Sports equipment and fitness accessories',
    image: '/images/categories/sports.jpg',
    isActive: true,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const products = [
  // Electronics
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip and titanium design',
    category: 'electronics',
    brand: 'Apple',
    originalPrice: 134900,
    salePrice: 129900,
    images: [
      '/images/products/iphone-15-pro-1.jpg',
      '/images/products/iphone-15-pro-2.jpg',
      '/images/products/iphone-15-pro-3.jpg'
    ],
    specifications: {
      display: '6.1-inch Super Retina XDR',
      storage: '256GB',
      camera: '48MP Main Camera',
      processor: 'A17 Pro chip'
    },
    stock: 50,
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.8, count: 1250 },
    tags: ['smartphone', 'apple', 'premium'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'samsung-galaxy-s24',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Flagship Samsung phone with S Pen and AI features',
    category: 'electronics',
    brand: 'Samsung',
    originalPrice: 124999,
    salePrice: 119999,
    images: [
      '/images/products/galaxy-s24-1.jpg',
      '/images/products/galaxy-s24-2.jpg'
    ],
    specifications: {
      display: '6.8-inch Dynamic AMOLED 2X',
      storage: '256GB',
      camera: '200MP Main Camera',
      processor: 'Snapdragon 8 Gen 3'
    },
    stock: 35,
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.7, count: 890 },
    tags: ['smartphone', 'samsung', 'android'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'macbook-air-m3',
    name: 'MacBook Air M3',
    description: 'Lightweight laptop with M3 chip and all-day battery',
    category: 'electronics',
    brand: 'Apple',
    originalPrice: 114900,
    salePrice: 109900,
    images: [
      '/images/products/macbook-air-m3-1.jpg',
      '/images/products/macbook-air-m3-2.jpg'
    ],
    specifications: {
      display: '13.6-inch Liquid Retina',
      storage: '256GB SSD',
      memory: '8GB Unified Memory',
      processor: 'Apple M3 chip'
    },
    stock: 25,
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.9, count: 650 },
    tags: ['laptop', 'apple', 'macbook'],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Fashion
  {
    id: 'nike-air-max-270',
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Air Max technology',
    category: 'fashion',
    brand: 'Nike',
    originalPrice: 12995,
    salePrice: 9999,
    images: [
      '/images/products/nike-air-max-1.jpg',
      '/images/products/nike-air-max-2.jpg'
    ],
    specifications: {
      material: 'Mesh and synthetic leather',
      sole: 'Rubber outsole',
      technology: 'Air Max cushioning',
      sizes: ['7', '8', '9', '10', '11']
    },
    stock: 100,
    isActive: true,
    isFeatured: false,
    ratings: { average: 4.5, count: 450 },
    tags: ['shoes', 'nike', 'running', 'sports'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'levi-501-jeans',
    name: "Levi's 501 Original Jeans",
    description: 'Classic straight fit jeans, the original since 1873',
    category: 'fashion',
    brand: "Levi's",
    originalPrice: 4999,
    salePrice: 3999,
    images: [
      '/images/products/levis-501-1.jpg',
      '/images/products/levis-501-2.jpg'
    ],
    specifications: {
      fit: 'Straight',
      material: '100% Cotton',
      wash: 'Medium Stonewash',
      sizes: ['28', '30', '32', '34', '36', '38']
    },
    stock: 75,
    isActive: true,
    isFeatured: false,
    ratings: { average: 4.6, count: 320 },
    tags: ['jeans', 'levis', 'denim', 'classic'],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Home & Kitchen
  {
    id: 'instant-pot-duo-7-in-1',
    name: 'Instant Pot Duo 7-in-1',
    description: 'Multi-functional pressure cooker and slow cooker',
    category: 'home-kitchen',
    brand: 'Instant Pot',
    originalPrice: 8999,
    salePrice: 6999,
    images: [
      '/images/products/instant-pot-1.jpg',
      '/images/products/instant-pot-2.jpg'
    ],
    specifications: {
      capacity: '6 Quart',
      functions: 'Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer',
      material: 'Stainless Steel',
      warranty: '1 Year'
    },
    stock: 40,
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.7, count: 890 },
    tags: ['kitchen', 'cooking', 'appliance', 'instant-pot'],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Books
  {
    id: 'atomic-habits-book',
    name: 'Atomic Habits',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    category: 'books',
    brand: 'Avery',
    originalPrice: 699,
    salePrice: 499,
    images: [
      '/images/products/atomic-habits-1.jpg'
    ],
    specifications: {
      author: 'James Clear',
      pages: '320',
      language: 'English',
      publisher: 'Avery',
      isbn: '9780735211292'
    },
    stock: 200,
    isActive: true,
    isFeatured: true,
    ratings: { average: 4.8, count: 1500 },
    tags: ['self-help', 'habits', 'productivity', 'bestseller'],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Sports
  {
    id: 'yoga-mat-premium',
    name: 'Premium Yoga Mat',
    description: 'Non-slip yoga mat for all levels of practice',
    category: 'sports',
    brand: 'YogaStudio',
    originalPrice: 2999,
    salePrice: 1999,
    images: [
      '/images/products/yoga-mat-1.jpg',
      '/images/products/yoga-mat-2.jpg'
    ],
    specifications: {
      material: 'TPE (Thermoplastic Elastomer)',
      thickness: '6mm',
      size: '183cm x 61cm',
      features: 'Non-slip, Eco-friendly, Lightweight'
    },
    stock: 80,
    isActive: true,
    isFeatured: false,
    ratings: { average: 4.4, count: 230 },
    tags: ['yoga', 'fitness', 'exercise', 'mat'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Admin configuration
const adminConfig = {
  id: 'settings',
  siteName: 'Flipkart Clone',
  siteDescription: 'Your one-stop shop for everything',
  currency: 'INR',
  currencySymbol: '₹',
  taxRate: 0.18, // 18% GST
  shippingRates: {
    standard: 49,
    express: 99,
    freeShippingThreshold: 500
  },
  paymentMethods: {
    cod: true,
    upi: true,
    cards: true,
    netbanking: true,
    wallets: true
  },
  socialMedia: {
    facebook: 'https://facebook.com/flipkart-clone',
    twitter: 'https://twitter.com/flipkart_clone',
    instagram: 'https://instagram.com/flipkart_clone'
  },
  contactInfo: {
    email: 'support@flipkart-clone.com',
    phone: '+91-1800-123-4567',
    address: '123 E-commerce Street, Digital City, Tech State 12345'
  },
  features: {
    guestCheckout: true,
    wishlist: true,
    reviews: true,
    notifications: true,
    analytics: true
  },
  updatedAt: new Date()
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create a batch for better performance
    const batch = writeBatch(db);

    // Seed categories
    console.log('📂 Seeding categories...');
    for (const category of categories) {
      const categoryRef = doc(db, 'categories', category.id);
      batch.set(categoryRef, category);
    }

    // Seed products
    console.log('🛍️ Seeding products...');
    for (const product of products) {
      const productRef = doc(db, 'products', product.id);
      batch.set(productRef, product);
      
      // Create inventory entry
      const inventoryRef = doc(db, 'inventory', product.id);
      batch.set(inventoryRef, {
        productId: product.id,
        stock: product.stock,
        reserved: 0,
        lowStockThreshold: 10,
        lastUpdated: new Date()
      });
    }

    // Seed admin configuration
    console.log('⚙️ Seeding admin configuration...');
    const adminRef = doc(db, 'admin', 'settings');
    batch.set(adminRef, adminConfig);

    // Create sample coupons
    console.log('🎟️ Creating sample coupons...');
    const coupons = [
      {
        id: 'WELCOME10',
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrderValue: 500,
        maxDiscount: 200,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usageLimit: 1000,
        usedCount: 0,
        applicableCategories: [],
        createdAt: new Date()
      },
      {
        id: 'SAVE50',
        code: 'SAVE50',
        type: 'fixed',
        value: 50,
        minOrderValue: 200,
        maxDiscount: 50,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        usageLimit: 500,
        usedCount: 0,
        applicableCategories: ['electronics'],
        createdAt: new Date()
      }
    ];

    for (const coupon of coupons) {
      const couponRef = doc(db, 'coupons', coupon.id);
      batch.set(couponRef, coupon);
    }

    // Commit the batch
    await batch.commit();

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded ${categories.length} categories`);
    console.log(`🛍️ Seeded ${products.length} products`);
    console.log(`🎟️ Created ${coupons.length} coupons`);
    console.log('⚙️ Admin configuration set up');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🎉 Seeding process completed!');
    process.exit(0);
  });
}

export { seedDatabase };
