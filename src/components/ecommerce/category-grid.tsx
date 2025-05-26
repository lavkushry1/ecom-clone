import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryGridSkeleton } from '@/components/ui/skeleton'

const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    image: '/images/categories/electronics.jpg',
    subcategories: ['Smartphones', 'Laptops', 'Headphones', 'Cameras']
  },
  {
    id: 'fashion',
    name: 'Fashion',
    image: '/images/categories/fashion.jpg',
    subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Accessories']
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    image: '/images/categories/home-kitchen.jpg',
    subcategories: ['Furniture', 'Home Decor', 'Kitchen Appliances', 'Bedding']
  },
  {
    id: 'books',
    name: 'Books',
    image: '/images/categories/books.jpg',
    subcategories: ['Fiction', 'Non-Fiction', 'Textbooks', 'Children\'s Books']
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    image: '/images/categories/sports.jpg',
    subcategories: ['Exercise Equipment', 'Sports Gear', 'Outdoor Recreation', 'Fitness Accessories']
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    image: '/images/categories/beauty.jpg',
    subcategories: ['Skincare', 'Makeup', 'Hair Care', 'Personal Care']
  }
]

export function CategoryGrid() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <CategoryGridSkeleton />;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.id}`}>
              <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100">
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {category.name === 'Electronics' && '📱'}
                      {category.name === 'Fashion' && '👕'}
                      {category.name === 'Home & Kitchen' && '🏠'}
                      {category.name === 'Books' && '📚'}
                      {category.name === 'Sports & Fitness' && '⚽'}
                      {category.name === 'Beauty & Personal Care' && '💄'}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium group-hover:text-flipkart-blue transition-colors">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
