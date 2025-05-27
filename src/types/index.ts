// TypeScript type definitions for the application

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  addresses: Address[]
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  displayName?: string
  email?: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  preferences?: {
    language: string
    currency: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  lastActiveAt?: any
  createdAt?: any
  updatedAt?: any
}

export interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  userId?: string
  createdAt?: any
  updatedAt?: any
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  brand: string
  images: string[]
  originalPrice: number
  salePrice: number
  stock: number
  specifications: Record<string, string>
  features?: string[]
  ratings: {
    average: number
    count: number
  }
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export interface CartItemWithId extends CartItem {
  id: string
  sessionId?: string
}

export interface Cart {
  id: string
  userId?: string // undefined for guest carts
  sessionId?: string // for guest carts
  items: CartItem[]
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId?: string
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  items: CartItem[]
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping: number
  tax: number
  total: number
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  type: 'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'cod'
  details: {
    last4?: string // for cards
    brand?: string // for cards
    upiId?: string // for UPI
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  productCount?: number
  createdAt?: string
  updatedAt?: string
}

// Type alias for backward compatibility
export type ProductCategory = Category;

export interface Wishlist {
  id: string
  userId: string
  productIds: string[]
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  comment: string
  images?: string[]
  isVerifiedPurchase: boolean
  createdAt: string
  updatedAt: string
}

// Form schemas
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface CheckoutForm {
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  shippingAddress: Omit<Address, 'id' | 'isDefault'>
  billingAddress: Omit<Address, 'id' | 'isDefault'>
  sameAsShipping: boolean
}

export interface PaymentForm {
  method: PaymentMethod['type']
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardholderName?: string
  upiId?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Search and Filter types
export interface ProductFilters {
  category?: string
  subcategory?: string
  brand?: string[]
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
  inStock?: boolean
  availability?: 'all' | 'in-stock' | 'out-of-stock'
  discount?: number
  sortBy?: 'price_low' | 'price_high' | 'rating' | 'newest' | 'popularity'
}

export interface SearchParams {
  q?: string
  category?: string
  page?: number
  limit?: number
  filters?: ProductFilters
}

// Payment specific types
export interface UPIPaymentData {
  upiId: string
  amount: number
  orderId: string
  merchantTransactionId?: string
}

export interface CreditCardData {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
  amount: number
  orderId: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
