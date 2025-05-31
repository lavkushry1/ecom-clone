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
exports.getInventoryReport = exports.updateStock = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const db = admin.firestore();
// Simple inventory functions for v2
exports.updateStock = functions.https.onCall({ cors: true }, async (request) => {
    var _a;
    try {
        if (!request.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Auth required");
        }
        const schema = zod_1.z.object({
            productId: zod_1.z.string(),
            quantity: zod_1.z.number(),
        });
        const { productId, quantity } = schema.parse(request.data);
        const productRef = db.collection("products").doc(productId);
        const doc = await productRef.get();
        if (!doc.exists) {
            throw new functions.https.HttpsError("not-found", "Product not found");
        }
        const currentStock = ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.stock) || 0;
        const newStock = currentStock + quantity;
        await productRef.update({
            stock: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            previousStock: currentStock,
            newStock,
            productId,
        };
    }
    catch (error) {
        console.error("Error updating stock:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to update stock");
    }
});
exports.getInventoryReport = functions.https.onCall({ cors: true }, async (request) => {
    var _a, _b;
    try {
        if (!((_b = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin)) {
            throw new functions.https.HttpsError("permission-denied", "Admin required");
        }
        const productsSnapshot = await db.collection("products").get();
        const products = productsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        const summary = {
            totalProducts: products.length,
            lowStockProducts: products.filter((p) => p.stock < 10).length,
            outOfStockProducts: products.filter((p) => p.stock === 0).length,
            inStockProducts: products.filter((p) => p.stock > 0).length,
            totalValue: products.reduce((sum, p) => sum + (p.salePrice * p.stock), 0),
        };
        return {
            success: true,
            summary,
            products: products.slice(0, 100), // Limit for performance
        };
    }
    catch (error) {
        console.error("Error getting inventory report:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to get inventory report");
    }
});
//# sourceMappingURL=inventory.js.map