/**
 * Firebase Functions Entry Point
 *
 * Import function triggers from their respective submodules:
 * - Inventory management functions
 * - Order processing functions
 * - Payment processing functions
 * - Product management functions
 * - Notification functions
 * - Validation functions
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export all functions for deployment
// Using the cleanest/best version of each function set
export * from "./inventory-clean";
export * from "./orders-simple";
export * from "./notifications";
export * from "./payment-simple";
export * from "./products-fixed";
export * from "./validation";
