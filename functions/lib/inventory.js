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
exports.restoreStockOnOrderCancel = exports.updateStockOnOrder = exports.getInventoryReport = exports.createRestockRequest = exports.setStockAlert = exports.bulkUpdateStock = exports.updateStock = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const db = admin.firestore();
const updateStockSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    quantity: zod_1.z.number().int(),
    operation: zod_1.z.enum(['set', 'increment', 'decrement']),
    reason: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
const bulkUpdateStockSchema = zod_1.z.object({
    updates: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string(),
        quantity: zod_1.z.number().int(),
        operation: zod_1.z.enum(['set', 'increment', 'decrement'])
    })),
    reason: zod_1.z.string().optional()
});
const stockAlertSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    threshold: zod_1.z.number().int().min(0)
});
const restockRequestSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    requestedQuantity: zod_1.z.number().int().positive(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']),
    notes: zod_1.z.string().optional()
});
exports.updateStock = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    try {
        const validatedData = updateStockSchema.parse(data);
        const { productId, quantity, operation, reason, notes } = validatedData;
        if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!userDoc.exists || ((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can update stock');
        }
        const productRef = db.collection('products').doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Product not found');
        }
        const currentStock = ((_c = productDoc.data()) === null || _c === void 0 ? void 0 : _c.stock) || 0;
        let newStock;
        switch (operation) {
            case 'set':
                newStock = quantity;
                break;
            case 'increment':
                newStock = currentStock + quantity;
                break;
            case 'decrement':
                newStock = Math.max(0, currentStock - quantity);
                break;
            default:
                throw new functions.https.HttpsError('invalid-argument', 'Invalid operation');
        }
        await productRef.update({
            stock: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('stockMovements').add({
            productId,
            previousStock: currentStock,
            newStock,
            quantity: operation === 'decrement' ? -quantity : quantity,
            operation,
            reason: reason || 'Manual update',
            notes,
            performedBy: context.auth.uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        await checkLowStockAlert(productId, newStock);
        return {
            success: true,
            previousStock: currentStock,
            newStock,
            productId
        };
    }
    catch (error) {
        console.error('Error updating stock:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to update stock');
    }
});
exports.bulkUpdateStock = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    try {
        const validatedData = bulkUpdateStockSchema.parse(data);
        const { updates, reason } = validatedData;
        if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!userDoc.exists || ((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can update stock');
        }
        const batch = db.batch();
        const results = [];
        for (const update of updates) {
            const { productId, quantity, operation } = update;
            const productRef = db.collection('products').doc(productId);
            const productDoc = await productRef.get();
            if (!productDoc.exists) {
                results.push({ productId, success: false, error: 'Product not found' });
                continue;
            }
            const currentStock = ((_c = productDoc.data()) === null || _c === void 0 ? void 0 : _c.stock) || 0;
            let newStock;
            switch (operation) {
                case 'set':
                    newStock = quantity;
                    break;
                case 'increment':
                    newStock = currentStock + quantity;
                    break;
                case 'decrement':
                    newStock = Math.max(0, currentStock - quantity);
                    break;
                default:
                    results.push({ productId, success: false, error: 'Invalid operation' });
                    continue;
            }
            batch.update(productRef, {
                stock: newStock,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const movementRef = db.collection('stockMovements').doc();
            batch.set(movementRef, {
                productId,
                previousStock: currentStock,
                newStock,
                quantity: operation === 'decrement' ? -quantity : quantity,
                operation,
                reason: reason || 'Bulk update',
                performedBy: context.auth.uid,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            results.push({
                productId,
                success: true,
                previousStock: currentStock,
                newStock
            });
        }
        await batch.commit();
        return {
            success: true,
            results,
            totalUpdated: results.filter(r => r.success).length
        };
    }
    catch (error) {
        console.error('Error bulk updating stock:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to bulk update stock');
    }
});
exports.setStockAlert = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        const validatedData = stockAlertSchema.parse(data);
        const { productId, threshold } = validatedData;
        if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!userDoc.exists || ((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can set stock alerts');
        }
        const productDoc = await db.collection('products').doc(productId).get();
        if (!productDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Product not found');
        }
        await db.collection('stockAlerts').doc(productId).set({
            productId,
            threshold,
            isActive: true,
            updatedBy: context.auth.uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return {
            success: true,
            productId,
            threshold
        };
    }
    catch (error) {
        console.error('Error setting stock alert:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to set stock alert');
    }
});
exports.createRestockRequest = functions.https.onCall(async (data, context) => {
    var _a;
    try {
        const validatedData = restockRequestSchema.parse(data);
        const { productId, requestedQuantity, priority, notes } = validatedData;
        if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const productDoc = await db.collection('products').doc(productId).get();
        if (!productDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Product not found');
        }
        const productData = productDoc.data();
        const restockRef = await db.collection('restockRequests').add({
            productId,
            productName: productData === null || productData === void 0 ? void 0 : productData.name,
            currentStock: (productData === null || productData === void 0 ? void 0 : productData.stock) || 0,
            requestedQuantity,
            priority,
            notes,
            status: 'pending',
            requestedBy: context.auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return {
            success: true,
            requestId: restockRef.id,
            productId,
            requestedQuantity,
            priority
        };
    }
    catch (error) {
        console.error('Error creating restock request:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to create restock request');
    }
});
exports.getInventoryReport = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!userDoc.exists || ((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can view inventory reports');
        }
        const productsSnapshot = await db.collection('products')
            .where('isActive', '==', true)
            .get();
        const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const alertsSnapshot = await db.collection('stockAlerts')
            .where('isActive', '==', true)
            .get();
        const alerts = new Map();
        alertsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            alerts.set(data.productId, data.threshold);
        });
        let totalProducts = 0;
        let lowStockProducts = 0;
        let outOfStockProducts = 0;
        let totalValue = 0;
        const inventoryData = products.map((product) => {
            const stock = product.stock || 0;
            const price = product.salePrice || 0;
            const threshold = alerts.get(product.id) || 10;
            totalProducts++;
            if (stock === 0)
                outOfStockProducts++;
            else if (stock <= threshold)
                lowStockProducts++;
            totalValue += stock * price;
            return {
                id: product.id,
                name: product.name,
                category: product.category,
                stock,
                threshold,
                price,
                value: stock * price,
                status: stock === 0 ? 'out-of-stock' : stock <= threshold ? 'low-stock' : 'in-stock'
            };
        });
        return {
            success: true,
            summary: {
                totalProducts,
                lowStockProducts,
                outOfStockProducts,
                inStockProducts: totalProducts - outOfStockProducts - lowStockProducts,
                totalValue: Math.round(totalValue * 100) / 100
            },
            products: inventoryData.sort((a, b) => {
                const statusOrder = { 'out-of-stock': 0, 'low-stock': 1, 'in-stock': 2 };
                return statusOrder[a.status] - statusOrder[b.status];
            })
        };
    }
    catch (error) {
        console.error('Error getting inventory report:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to get inventory report');
    }
});
async function checkLowStockAlert(productId, currentStock) {
    var _a, _b, _c;
    try {
        const alertDoc = await db.collection('stockAlerts').doc(productId).get();
        if (alertDoc.exists && ((_a = alertDoc.data()) === null || _a === void 0 ? void 0 : _a.isActive)) {
            const threshold = ((_b = alertDoc.data()) === null || _b === void 0 ? void 0 : _b.threshold) || 10;
            if (currentStock <= threshold) {
                const productDoc = await db.collection('products').doc(productId).get();
                const productName = ((_c = productDoc.data()) === null || _c === void 0 ? void 0 : _c.name) || 'Unknown Product';
                await db.collection('notifications').add({
                    type: 'low-stock-alert',
                    title: 'Low Stock Alert',
                    message: `${productName} is running low (${currentStock} remaining)`,
                    data: {
                        productId,
                        productName,
                        currentStock,
                        threshold
                    },
                    priority: currentStock === 0 ? 'high' : 'medium',
                    targetRole: 'admin',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isRead: false
                });
            }
        }
    }
    catch (error) {
        console.error('Error checking low stock alert:', error);
    }
}
exports.updateStockOnOrder = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap) => {
    var _a;
    try {
        const order = snap.data();
        const batch = db.batch();
        for (const item of order.items || []) {
            const productRef = db.collection('products').doc(item.productId);
            const productDoc = await productRef.get();
            if (productDoc.exists) {
                const currentStock = ((_a = productDoc.data()) === null || _a === void 0 ? void 0 : _a.stock) || 0;
                const newStock = Math.max(0, currentStock - item.quantity);
                batch.update(productRef, {
                    stock: newStock,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                const movementRef = db.collection('stockMovements').doc();
                batch.set(movementRef, {
                    productId: item.productId,
                    orderId: snap.id,
                    previousStock: currentStock,
                    newStock,
                    quantity: -item.quantity,
                    operation: 'decrement',
                    reason: 'Order placed',
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
                await checkLowStockAlert(item.productId, newStock);
            }
        }
        await batch.commit();
        console.log(`Stock updated for order ${snap.id}`);
    }
    catch (error) {
        console.error('Error updating stock on order:', error);
    }
});
exports.restoreStockOnOrderCancel = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change) => {
    var _a;
    try {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        if (beforeData.status !== 'cancelled' && afterData.status === 'cancelled') {
            const batch = db.batch();
            for (const item of afterData.items || []) {
                const productRef = db.collection('products').doc(item.productId);
                const productDoc = await productRef.get();
                if (productDoc.exists) {
                    const currentStock = ((_a = productDoc.data()) === null || _a === void 0 ? void 0 : _a.stock) || 0;
                    const newStock = currentStock + item.quantity;
                    batch.update(productRef, {
                        stock: newStock,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    const movementRef = db.collection('stockMovements').doc();
                    batch.set(movementRef, {
                        productId: item.productId,
                        orderId: change.after.id,
                        previousStock: currentStock,
                        newStock,
                        quantity: item.quantity,
                        operation: 'increment',
                        reason: 'Order cancelled',
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
            await batch.commit();
            console.log(`Stock restored for cancelled order ${change.after.id}`);
        }
    }
    catch (error) {
        console.error('Error restoring stock on order cancel:', error);
    }
});
//# sourceMappingURL=inventory.js.map