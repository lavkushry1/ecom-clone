import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { CallableContext } from 'firebase-functions/v1/https';

const db = admin.firestore();

// Validation schemas
const updateStockSchema = z.object({
  productId: z.string(),
  quantity: z.number().int(),
  operation: z.enum(['set', 'increment', 'decrement']),
  reason: z.string().optional(),
  notes: z.string().optional()
});

const bulkUpdateStockSchema = z.object({
  updates: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int(),
    operation: z.enum(['set', 'increment', 'decrement'])
  })),
  reason: z.string().optional()
});

const stockAlertSchema = z.object({
  productId: z.string(),
  threshold: z.number().int().min(0)
});

const restockRequestSchema = z.object({
  productId: z.string(),
  requestedQuantity: z.number().int().positive(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  notes: z.string().optional()
});

// Update product stock
export const updateStock = functions.https.onCall(async (data: any, context: CallableContext) => {
  try {
    // Validate input
    const validatedData = updateStockSchema.parse(data);
    const { productId, quantity, operation, reason, notes } = validatedData;

    // Check if user is admin
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can update stock');
    }

    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Product not found');
    }

    const currentStock = productDoc.data()?.stock || 0;
    let newStock: number;

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

    // Update product stock
    await productRef.update({
      stock: newStock,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log stock movement
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

    // Check for low stock alerts
    await checkLowStockAlert(productId, newStock);

    return {
      success: true,
      previousStock: currentStock,
      newStock,
      productId
    };

  } catch (error) {
    console.error('Error updating stock:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update stock');
  }
});

// Bulk update stock for multiple products
export const bulkUpdateStock = functions.https.onCall(async (data: any, context: CallableContext) => {
  try {
    // Validate input
    const validatedData = bulkUpdateStockSchema.parse(data);
    const { updates, reason } = validatedData;

    // Check if user is admin
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can update stock');
    }

    const batch = db.batch();
    const results: any[] = [];

    for (const update of updates) {
      const { productId, quantity, operation } = update;
      const productRef = db.collection('products').doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        results.push({ productId, success: false, error: 'Product not found' });
        continue;
      }

      const currentStock = productDoc.data()?.stock || 0;
      let newStock: number;

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

      // Add to batch
      batch.update(productRef, {
        stock: newStock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log stock movement
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

    // Execute batch
    await batch.commit();

    return {
      success: true,
      results,
      totalUpdated: results.filter(r => r.success).length
    };

  } catch (error) {
    console.error('Error bulk updating stock:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to bulk update stock');
  }
});

// Set low stock alert threshold
export const setStockAlert = functions.https.onCall(async (data: any, context: CallableContext) => {
  try {
    // Validate input
    const validatedData = stockAlertSchema.parse(data);
    const { productId, threshold } = validatedData;

    // Check if user is admin
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can set stock alerts');
    }

    // Check if product exists
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Product not found');
    }

    // Set or update stock alert
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

  } catch (error) {
    console.error('Error setting stock alert:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to set stock alert');
  }
});

// Create restock request
export const createRestockRequest = functions.https.onCall(async (data: any, context: CallableContext) => {
  try {
    // Validate input
    const validatedData = restockRequestSchema.parse(data);
    const { productId, requestedQuantity, priority, notes } = validatedData;

    // Check if user is authenticated
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if product exists
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Product not found');
    }

    const productData = productDoc.data();

    // Create restock request
    const restockRef = await db.collection('restockRequests').add({
      productId,
      productName: productData?.name,
      currentStock: productData?.stock || 0,
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

  } catch (error) {
    console.error('Error creating restock request:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to create restock request');
  }
});

// Get inventory report
export const getInventoryReport = functions.https.onCall(async (data: any, context: CallableContext) => {
  try {
    // Check if user is admin
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can view inventory reports');
    }

    // Get all products with their stock levels
    const productsSnapshot = await db.collection('products')
      .where('isActive', '==', true)
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get stock alerts
    const alertsSnapshot = await db.collection('stockAlerts')
      .where('isActive', '==', true)
      .get();

    const alerts = new Map();
    alertsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      alerts.set(data.productId, data.threshold);
    });

    // Calculate inventory stats
    let totalProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalValue = 0;

    const inventoryData = products.map((product: any) => {
      const stock = product.stock || 0;
      const price = product.salePrice || 0;
      const threshold = alerts.get(product.id) || 10;

      totalProducts++;
      if (stock === 0) outOfStockProducts++;
      else if (stock <= threshold) lowStockProducts++;
      
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
        // Sort by status priority: out-of-stock, low-stock, in-stock
        const statusOrder = { 'out-of-stock': 0, 'low-stock': 1, 'in-stock': 2 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      })
    };

  } catch (error) {
    console.error('Error getting inventory report:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to get inventory report');
  }
});

// Helper function to check low stock alerts
async function checkLowStockAlert(productId: string, currentStock: number): Promise<void> {
  try {
    const alertDoc = await db.collection('stockAlerts').doc(productId).get();
    
    if (alertDoc.exists && alertDoc.data()?.isActive) {
      const threshold = alertDoc.data()?.threshold || 10;
      
      if (currentStock <= threshold) {
        // Send notification to admins
        const productDoc = await db.collection('products').doc(productId).get();
        const productName = productDoc.data()?.name || 'Unknown Product';
        
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
  } catch (error) {
    console.error('Error checking low stock alert:', error);
    // Don't throw error here as it's a helper function
  }
}

// Firestore trigger to update stock when order is placed
export const updateStockOnOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap) => {
    try {
      const order = snap.data();
      const batch = db.batch();

      // Update stock for each product in the order
      for (const item of order.items || []) {
        const productRef = db.collection('products').doc(item.productId);
        const productDoc = await productRef.get();
        
        if (productDoc.exists) {
          const currentStock = productDoc.data()?.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          
          batch.update(productRef, {
            stock: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Log stock movement
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

          // Check for low stock alerts
          await checkLowStockAlert(item.productId, newStock);
        }
      }

      await batch.commit();
      console.log(`Stock updated for order ${snap.id}`);

    } catch (error) {
      console.error('Error updating stock on order:', error);
    }
  });

// Firestore trigger to restore stock when order is cancelled
export const restoreStockOnOrderCancel = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();

      // Check if order status changed to cancelled
      if (beforeData.status !== 'cancelled' && afterData.status === 'cancelled') {
        const batch = db.batch();

        // Restore stock for each product in the order
        for (const item of afterData.items || []) {
          const productRef = db.collection('products').doc(item.productId);
          const productDoc = await productRef.get();
          
          if (productDoc.exists) {
            const currentStock = productDoc.data()?.stock || 0;
            const newStock = currentStock + item.quantity;
            
            batch.update(productRef, {
              stock: newStock,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Log stock movement
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

    } catch (error) {
      console.error('Error restoring stock on order cancel:', error);
    }
  });
