import { useState, useEffect, useCallback } from 'react';
import { Product, Category } from '@/types';
import { productService } from '@/lib/firebase/services/productService';
import { DocumentSnapshot } from 'firebase/firestore';

interface UseProductsOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  limitCount?: number;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchProducts: () => Promise<void>;
  fetchMoreProducts: () => Promise<void>;
  searchProducts: (term: string) => Promise<void>;
  featuredProducts: Product[];
  fetchFeaturedProducts: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>();

  const {
    category,
    minPrice,
    maxPrice,
    searchTerm,
    limitCount = 20,
    autoFetch = true
  } = options;

  // Fetch products with filters
  const fetchProducts = useCallback(async (reset = true) => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        category,
        minPrice,
        maxPrice,
        searchTerm,
        limitCount,
        lastDoc: reset ? undefined : lastDoc,
      };

      const result = await productService.getProducts(filters);

      if (reset) {
        setProducts(result.products);
      } else {
        setProducts(prev => [...prev, ...result.products]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.products.length === limitCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [category, minPrice, maxPrice, searchTerm, limitCount, lastDoc]);

  // Fetch more products (pagination)
  const fetchMoreProducts = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchProducts(false);
  }, [fetchProducts, hasMore, loading]);

  // Search products
  const searchProducts = useCallback(async (term: string) => {
    try {
      setLoading(true);
      setError(null);

      const results = await productService.searchProducts(term, limitCount);
      setProducts(results);
      setHasMore(false); // Search results don't support pagination in this implementation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  }, [limitCount]);

  // Fetch featured products
  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const featured = await productService.getFeaturedProducts(8);
      setFeaturedProducts(featured);
    } catch (err) {
      console.error('Error fetching featured products:', err);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Refetch all data
  const refetch = useCallback(async () => {
    setLastDoc(undefined);
    await Promise.all([
      fetchProducts(true),
      fetchCategories(),
      fetchFeaturedProducts(),
    ]);
  }, [fetchProducts, fetchCategories, fetchFeaturedProducts]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      setLastDoc(undefined);
      fetchProducts(true);
    }
  }, [category, minPrice, maxPrice, searchTerm, autoFetch]);

  // Fetch categories and featured products on mount
  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
  }, [fetchCategories, fetchFeaturedProducts]);

  return {
    products,
    categories,
    loading,
    error,
    hasMore,
    fetchProducts: () => fetchProducts(true),
    fetchMoreProducts,
    searchProducts,
    featuredProducts,
    fetchFeaturedProducts,
    refetch,
  };
}

// Hook for single product
export function useProduct(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const productData = await productService.getProductById(productId);
      setProduct(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}

// Hook for products by category
export function useProductsByCategory(categoryId: string, limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      setError(null);

      const productsData = await productService.getProductsByCategory(categoryId, limit);
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products by category:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}
