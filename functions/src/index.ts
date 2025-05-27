import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin
admin.initializeApp()

// Import all function modules
import { 
  processOrder, 
  updateOrderStatus,
  getOrderById,
  getUserOrders 
} from './orders'

import { 
  generateUPIPaymentDetails,
  verifyPaymentStatus,
  processPayment 
} from './payment'

import { 
  validateZipCode,
  validateEmail,
  validatePhone 
} from './validation'

import { 
  sendOrderConfirmation,
  sendOrderUpdate,
  sendWelcomeEmail 
} from './notifications'

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  searchProducts
} from './products'

import {
  updateStock,
  bulkUpdateStock,
  setStockAlert,
  createRestockRequest,
  getInventoryReport,
  updateStockOnOrder,
  restoreStockOnOrderCancel
} from './inventory'

// Export all Cloud Functions
export {
  // Order Functions
  processOrder,
  updateOrderStatus,
  getOrderById,
  getUserOrders,
  
  // Payment Functions
  generateUPIPaymentDetails,
  verifyPaymentStatus,
  processPayment,
  
  // Validation Functions
  validateZipCode,
  validateEmail,
  validatePhone,
  
  // Notification Functions
  sendOrderConfirmation,
  sendOrderUpdate,
  sendWelcomeEmail,
  
  // Product Functions
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  searchProducts,
  
  // Inventory Functions
  updateStock,
  bulkUpdateStock,
  setStockAlert,
  createRestockRequest,
  getInventoryReport,
  updateStockOnOrder,
  restoreStockOnOrderCancel
}
