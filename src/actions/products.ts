'use server'

import { adminDb } from '@/lib/firebase/admin'
import { Product, PaginatedResponse, ProductFilters } from '@/types'

export async function getProducts(
  page = 1,
  limit = 20,
  filters?: ProductFilters
): Promise<PaginatedResponse<Product>> {
  try {
    let query = adminDb.collection('products').where('isActive', '==', true)

    // Apply filters
    if (filters?.category) {
      query = query.where('category', '==', filters.category)
    }
    if (filters?.subcategory) {
      query = query.where('subcategory', '==', filters.subcategory)
    }
    if (filters?.brand && filters.brand.length > 0) {
      query = query.where('brand', 'in', filters.brand)
    }
    if (filters?.inStock) {
      query = query.where('stock', '>', 0)
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'price_low':
        query = query.orderBy('salePrice', 'asc')
        break
      case 'price_high':
        query = query.orderBy('salePrice', 'desc')
        break
      case 'rating':
        query = query.orderBy('ratings.average', 'desc')
        break
      case 'newest':
        query = query.orderBy('createdAt', 'desc')
        break
      default:
        query = query.orderBy('createdAt', 'desc')
    }

    // Pagination
    const offset = (page - 1) * limit
    const snapshot = await query.offset(offset).limit(limit).get()

    const products: Product[] = []
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() } as Product)
    })

    // Get total count (this is expensive, consider caching)
    const totalSnapshot = await adminDb.collection('products')
      .where('isActive', '==', true)
      .count()
      .get()
    const total = totalSnapshot.data().count

    return {
      items: products,
      total,
      page,
      limit,
      hasMore: offset + products.length < total
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const doc = await adminDb.collection('products').doc(id).get()
    
    if (!doc.exists) {
      return null
    }

    return { id: doc.id, ...doc.data() } as Product
  } catch (error) {
    console.error('Error fetching product:', error)
    throw new Error('Failed to fetch product')
  }
}

export async function searchProducts(
  query: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Product>> {
  try {
    // This is a basic implementation. For production, consider using Algolia or Elasticsearch
    const snapshot = await adminDb.collection('products')
      .where('isActive', '==', true)
      .orderBy('name')
      .startAt(query)
      .endAt(query + '\uf8ff')
      .offset((page - 1) * limit)
      .limit(limit)
      .get()

    const products: Product[] = []
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() } as Product)
    })

    // For simplicity, we're not getting exact count for search results
    return {
      items: products,
      total: products.length,
      page,
      limit,
      hasMore: products.length === limit
    }
  } catch (error) {
    console.error('Error searching products:', error)
    throw new Error('Failed to search products')
  }
}

export async function getFeaturedProducts(limit = 10): Promise<Product[]> {
  try {
    const snapshot = await adminDb.collection('products')
      .where('isActive', '==', true)
      .where('tags', 'array-contains', 'featured')
      .orderBy('ratings.average', 'desc')
      .limit(limit)
      .get()

    const products: Product[] = []
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() } as Product)
    })

    return products
  } catch (error) {
    console.error('Error fetching featured products:', error)
    throw new Error('Failed to fetch featured products')
  }
}
