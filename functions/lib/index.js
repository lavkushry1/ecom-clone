"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreStockOnOrderCancel = exports.updateStockOnOrder = exports.getInventoryReport = exports.createRestockRequest = exports.setStockAlert = exports.bulkUpdateStock = exports.updateStock = exports.getProductRecommendations = exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.sendNotification = exports.sendOrderStatusUpdate = exports.sendOrderConfirmation = exports.validatePhone = exports.validateEmail = exports.validateZipCode = exports.processPayment = exports.verifyPaymentStatus = exports.generateUPIPaymentDetails = exports.getUserOrders = exports.getOrderById = exports.updateOrderStatus = exports.processOrder = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const orders_1 = require("./orders");
Object.defineProperty(exports, "processOrder", { enumerable: true, get: function () { return orders_1.processOrder; } });
Object.defineProperty(exports, "updateOrderStatus", { enumerable: true, get: function () { return orders_1.updateOrderStatus; } });
Object.defineProperty(exports, "getOrderById", { enumerable: true, get: function () { return orders_1.getOrderById; } });
Object.defineProperty(exports, "getUserOrders", { enumerable: true, get: function () { return orders_1.getUserOrders; } });
const payment_1 = require("./payment");
Object.defineProperty(exports, "generateUPIPaymentDetails", { enumerable: true, get: function () { return payment_1.generateUPIPaymentDetails; } });
Object.defineProperty(exports, "verifyPaymentStatus", { enumerable: true, get: function () { return payment_1.verifyPaymentStatus; } });
Object.defineProperty(exports, "processPayment", { enumerable: true, get: function () { return payment_1.processPayment; } });
const validation_1 = require("./validation");
Object.defineProperty(exports, "validateZipCode", { enumerable: true, get: function () { return validation_1.validateZipCode; } });
Object.defineProperty(exports, "validateEmail", { enumerable: true, get: function () { return validation_1.validateEmail; } });
Object.defineProperty(exports, "validatePhone", { enumerable: true, get: function () { return validation_1.validatePhone; } });
const notifications_1 = require("./notifications");
Object.defineProperty(exports, "sendOrderConfirmation", { enumerable: true, get: function () { return notifications_1.sendOrderConfirmation; } });
Object.defineProperty(exports, "sendOrderStatusUpdate", { enumerable: true, get: function () { return notifications_1.sendOrderStatusUpdate; } });
Object.defineProperty(exports, "sendNotification", { enumerable: true, get: function () { return notifications_1.sendNotification; } });
const products_1 = require("./products");
Object.defineProperty(exports, "createProduct", { enumerable: true, get: function () { return products_1.createProduct; } });
Object.defineProperty(exports, "updateProduct", { enumerable: true, get: function () { return products_1.updateProduct; } });
Object.defineProperty(exports, "deleteProduct", { enumerable: true, get: function () { return products_1.deleteProduct; } });
Object.defineProperty(exports, "searchProducts", { enumerable: true, get: function () { return products_1.searchProducts; } });
Object.defineProperty(exports, "getProductRecommendations", { enumerable: true, get: function () { return products_1.getProductRecommendations; } });
const inventory_1 = require("./inventory");
Object.defineProperty(exports, "updateStock", { enumerable: true, get: function () { return inventory_1.updateStock; } });
Object.defineProperty(exports, "bulkUpdateStock", { enumerable: true, get: function () { return inventory_1.bulkUpdateStock; } });
Object.defineProperty(exports, "setStockAlert", { enumerable: true, get: function () { return inventory_1.setStockAlert; } });
Object.defineProperty(exports, "createRestockRequest", { enumerable: true, get: function () { return inventory_1.createRestockRequest; } });
Object.defineProperty(exports, "getInventoryReport", { enumerable: true, get: function () { return inventory_1.getInventoryReport; } });
Object.defineProperty(exports, "updateStockOnOrder", { enumerable: true, get: function () { return inventory_1.updateStockOnOrder; } });
Object.defineProperty(exports, "restoreStockOnOrderCancel", { enumerable: true, get: function () { return inventory_1.restoreStockOnOrderCancel; } });
//# sourceMappingURL=index.js.map