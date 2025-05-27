'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, Package, Tag, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AdvancedSkeleton } from '@/components/ui/advanced-skeleton';

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  level?: number; // Added for hierarchical display
}

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
  slug: string;
  imageUrl: string;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          slug: 'electronics',
          isActive: true,
          productCount: 245,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          seoTitle: 'Electronics - Best Deals on Gadgets',
          seoDescription: 'Shop the latest electronics and gadgets at amazing prices',
          sortOrder: 1
        },
        {
          id: '2',
          name: 'Smartphones',
          description: 'Latest smartphones and mobile accessories',
          parentId: '1',
          slug: 'smartphones',
          isActive: true,
          productCount: 89,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-16'),
          seoTitle: 'Smartphones - Latest Mobile Phones',
          seoDescription: 'Browse the latest smartphones from top brands',
          sortOrder: 1
        },
        {
          id: '3',
          name: 'Fashion',
          description: 'Clothing, shoes, and fashion accessories',
          slug: 'fashion',
          isActive: true,
          productCount: 567,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-17'),
          seoTitle: 'Fashion - Trendy Clothing & Accessories',
          seoDescription: 'Discover the latest fashion trends and styles',
          sortOrder: 2
        },
        {
          id: '4',
          name: 'Men\'s Clothing',
          description: 'Shirts, pants, suits, and men\'s accessories',
          parentId: '3',
          slug: 'mens-clothing',
          isActive: true,
          productCount: 234,
          createdAt: new Date('2024-01-04'),
          updatedAt: new Date('2024-01-18'),
          seoTitle: 'Men\'s Clothing - Fashion for Men',
          seoDescription: 'Shop the best men\'s clothing and accessories',
          sortOrder: 1
        },
        {
          id: '5',
          name: 'Home & Kitchen',
          description: 'Home appliances and kitchen essentials',
          slug: 'home-kitchen',
          isActive: true,
          productCount: 178,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-19'),
          seoTitle: 'Home & Kitchen - Quality Appliances',
          seoDescription: 'Find everything for your home and kitchen needs',
          sortOrder: 3
        },
        {
          id: '6',
          name: 'Books',
          description: 'Books, magazines, and educational content',
          slug: 'books',
          isActive: false,
          productCount: 45,
          createdAt: new Date('2024-01-06'),
          updatedAt: new Date('2024-01-20'),
          seoTitle: 'Books - Knowledge at Your Fingertips',
          seoDescription: 'Explore our collection of books and educational materials',
          sortOrder: 4
        }
      ];

      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      // Check if category has subcategories or products
      const hasSubcategories = categories.some(cat => cat.parentId === categoryId);
      const category = categories.find(cat => cat.id === categoryId);
      
      if (hasSubcategories) {
        toast({
          title: "Cannot Delete",
          description: "This category has subcategories. Please delete them first.",
          variant: "destructive",
        });
        return;
      }

      if (category && category.productCount > 0) {
        const confirmed = confirm(`This category has ${category.productCount} products. Are you sure you want to delete it?`);
        if (!confirmed) return;
      }

      // Mock API call - replace with actual implementation
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  }, [categories, toast]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryHierarchy = (categories: Category[]): Category[] => {
    const rootCategories = categories.filter(cat => !cat.parentId);
    const buildHierarchy = (parentId?: string, level = 0): Category[] => {
      const children = categories.filter(cat => cat.parentId === parentId);
      return children.flatMap(child => [
        { ...child, level },
        ...buildHierarchy(child.id, level + 1)
      ]);
    };
    
    return rootCategories.flatMap(root => [
      { ...root, level: 0 },
      ...buildHierarchy(root.id, 1)
    ]);
  };

  const hierarchicalCategories = getCategoryHierarchy(filteredCategories);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-gray-600 mt-1">Organize your products into categories</p>
          </div>
          <AdvancedSkeleton className="h-10 w-32 rounded-lg" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6">
              <AdvancedSkeleton className="h-6 w-3/4 mb-4" />
              <AdvancedSkeleton className="h-4 w-full mb-2" />
              <AdvancedSkeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <AdvancedSkeleton className="h-6 w-16 rounded-full" />
                <div className="flex gap-2">
                  <AdvancedSkeleton className="h-8 w-8 rounded" />
                  <AdvancedSkeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-gray-600 mt-1">Organize your products into categories and subcategories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm 
              category={editingCategory}
              categories={categories}
              onSave={(category) => {
                if (editingCategory) {
                  setCategories(prev => prev.map(cat => cat.id === category.id ? category : cat));
                } else {
                  setCategories(prev => [category, ...prev]);
                }
                setIsDialogOpen(false);
                setEditingCategory(null);
              }}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingCategory(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FolderOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold">{categories.filter(cat => cat.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{categories.reduce((sum, cat) => sum + cat.productCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Tag className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Subcategories</p>
                <p className="text-2xl font-bold">{categories.filter(cat => cat.parentId).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hierarchicalCategories.map((category) => (
          <Card key={category.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${category.level && category.level > 0 ? 'ml-8 border-l-4 border-l-blue-200' : ''}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {category.level && category.level > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Subcategory
                        </span>
                      )}
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(category);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Category Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Products:</span>
                    <Badge variant="outline">{category.productCount}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Slug:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                  </div>

                  {category.seoTitle && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">SEO Title:</p>
                      <p className="text-sm">{category.seoTitle}</p>
                    </div>
                  )}
                </div>

                {/* Category Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Products
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Add Subcategory
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No categories found</p>
          <p className="text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

// Category Form Component
interface CategoryFormProps {
  category?: Category | null;
  categories: Category[];
  onSave: (category: Category) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    description: category?.description || '',
    parentId: category?.parentId || '',
    slug: category?.slug || '',
    imageUrl: category?.imageUrl || '',
    isActive: category?.isActive ?? true,
    seoTitle: category?.seoTitle || '',
    seoDescription: category?.seoDescription || '',
    sortOrder: category?.sortOrder || 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Category name is required');
      }

      if (!formData.slug.trim()) {
        throw new Error('Category slug is required');
      }

      // Check for duplicate slug
      const existingSlug = categories.find(cat => 
        cat.slug === formData.slug && cat.id !== category?.id
      );
      if (existingSlug) {
        throw new Error('A category with this slug already exists');
      }

      // Mock API call - replace with actual implementation
      const savedCategory: Category = {
        id: category?.id || `cat_${Date.now()}`,
        ...formData,
        productCount: category?.productCount || 0,
        createdAt: category?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      onSave(savedCategory);
      
      toast({
        title: "Success",
        description: `Category ${category ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parentCategories = categories.filter(cat => !cat.parentId && cat.id !== category?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="parentId">Parent Category</Label>
          <Select 
            value={formData.parentId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No parent (root category)</SelectItem>
              {parentCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          placeholder="https://example.com/category-image.jpg"
        />
      </div>

      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium">SEO Settings</h4>
        <div>
          <Label htmlFor="seoTitle">SEO Title</Label>
          <Input
            id="seoTitle"
            value={formData.seoTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
            placeholder="Optimized title for search engines"
          />
        </div>
        <div>
          <Label htmlFor="seoDescription">SEO Description</Label>
          <Textarea
            id="seoDescription"
            value={formData.seoDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
            placeholder="Brief description for search engine results"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="rounded"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (category ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default CategoryManagement;
