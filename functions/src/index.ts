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
  sendOrderStatusUpdate,
  sendNotification
} from './notifications'

import {
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductRecommendations
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
  sendOrderStatusUpdate,
  sendNotification,
  
  // Product Functions
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductRecommendations,
  
  // Inventory Functions
  updateStock,
  bulkUpdateStock,
  setStockAlert,
  createRestockRequest,
  getInventoryReport,
  updateStockOnOrder,
  restoreStockOnOrderCancel
}
