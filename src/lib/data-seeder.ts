// Data seeding utility for Firebase
import { ProductService, CategoryService } from './firebase-services';
import { sampleProducts, sampleCategories } from './sample-data';

export class DataSeeder {
  static async seedProducts() {
    console.log('Starting product seeding...');
    
    try {
      for (const product of sampleProducts) {
        // Transform the sample product data to match the Product type
        const transformedProduct = {
          name: product.name,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory || '',
          brand: product.brand,
          images: product.images,
          originalPrice: product.price,
          salePrice: product.salePrice,
          stock: product.stock,
          specifications: Object.fromEntries(
            Object.entries(product.specifications).filter(([key, value]) => value !== undefined)
          ) as Record<string, string>,
          ratings: {
            average: (product as any).rating || 0,
            count: (product as any).reviews || 0
          },
          tags: product.tags,
          features: (product as any).features || [],
          isActive: product.isActive
        };
        
        const productId = await ProductService.createProduct(transformedProduct);
        console.log(`Created product: ${product.name} (ID: ${productId})`);
      }
      
      console.log(`Successfully seeded ${sampleProducts.length} products`);
    } catch (error) {
      console.error('Error seeding products:', error);
      throw error;
    }
  }

  static async seedCategories() {
    console.log('Starting category seeding...');
    
    try {
      // Note: This would need to be implemented in CategoryService
      // For now, we'll just log the categories
      console.log('Categories to seed:', sampleCategories);
      console.log(`Successfully processed ${sampleCategories.length} categories`);
    } catch (error) {
      console.error('Error seeding categories:', error);
      throw error;
    }
  }

  static async seedAll() {
    console.log('Starting complete database seeding...');
    
    try {
      await this.seedCategories();
      await this.seedProducts();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Database seeding failed:', error);
      throw error;
    }
  }

  static async clearProducts() {
    console.log('Note: This is a demo function. In production, implement proper cleanup logic.');
    // In a real implementation, you would implement product deletion logic here
  }
}

// Utility function to run seeding from command line or admin interface
export async function runSeeder() {
  try {
    await DataSeeder.seedAll();
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
}
