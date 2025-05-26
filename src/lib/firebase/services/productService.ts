import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  DocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../config';
import { Product, Category } from '@/types';

export class ProductService {
  private readonly productsCollection = collection(db, 'products');
  private readonly categoriesCollection = collection(db, 'categories');

  // Get all products with optional filters
  async getProducts(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
    limitCount?: number;
    lastDoc?: DocumentSnapshot;
  }): Promise<{ products: Product[]; lastDoc?: DocumentSnapshot }> {
    try {
      let q = query(this.productsCollection);

      // Apply filters
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters?.minPrice !== undefined) {
        q = query(q, where('price', '>=', filters.minPrice));
      }

      if (filters?.maxPrice !== undefined) {
        q = query(q, where('price', '<=', filters.maxPrice));
      }

      if (filters?.searchTerm) {
        // Note: Firestore doesn't support full-text search natively
        // This is a basic implementation - consider using Algolia for production
        q = query(q, where('name', '>=', filters.searchTerm));
        q = query(q, where('name', '<=', filters.searchTerm + '\uf8ff'));
      }

      // Add ordering and pagination
      q = query(q, orderBy('createdAt', 'desc'));

      if (filters?.lastDoc) {
        q = query(q, startAfter(filters.lastDoc));
      }

      if (filters?.limitCount) {
        q = query(q, limit(filters.limitCount));
      }

      const snapshot = await getDocs(q);
      const products: Product[] = [];

      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return { products, lastDoc };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get a single product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(this.productsCollection, id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data(),
        } as Product;
      }

      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // Get featured products
  async getFeaturedProducts(limitCount: number = 8): Promise<Product[]> {
    try {
      const q = query(
        this.productsCollection,
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const products: Product[] = [];

      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });

      return products;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw new Error('Failed to fetch featured products');
    }
  }

  // Get products by category
  async getProductsByCategory(categoryId: string, limitCount?: number): Promise<Product[]> {
    try {
      let q = query(
        this.productsCollection,
        where('category', '==', categoryId),
        orderBy('createdAt', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const products: Product[] = [];

      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });

      return products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  // Search products
  async searchProducts(searchTerm: string, limitCount: number = 20): Promise<Product[]> {
    try {
      // Basic search implementation
      // For production, consider using Algolia or Firebase Extensions for better search
      const q = query(
        this.productsCollection,
        where('searchKeywords', 'array-contains-any', 
          searchTerm.toLowerCase().split(' ').filter(word => word.length > 2)
        ),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const products: Product[] = [];

      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const q = query(this.categoriesCollection, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const categories: Category[] = [];

      snapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data(),
        } as Category);
      });

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Admin methods
  async createProduct(product: Omit<Product, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.productsCollection, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(this.productsCollection, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(this.productsCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
}

export const productService = new ProductService();
