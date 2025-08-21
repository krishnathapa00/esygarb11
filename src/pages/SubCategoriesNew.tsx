import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Filter, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts } from '@/hooks/useProducts';
import { useCartActions } from '@/hooks/useCart';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';

const SubCategoriesNew = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { handleAddToCart, handleUpdateQuantity, getCartQuantity } = useCartActions();
  const [activeSubcategory, setActiveSubcategory] = useState('all');

  // Map category slug to display name and get subcategories
  const getCategoryInfo = (slug: string) => {
    const categoryMap: { [key: string]: { name: string; filter: string; subcategories: string[] } } = {
      'fresh-vegetables': { 
        name: 'Fresh Vegetables', 
        filter: 'Fruits & Vegetables',
        subcategories: ['All', 'Leafy Greens', 'Root Vegetables', 'Seasonal']
      },
      'organic-fruits': { 
        name: 'Organic Fruits', 
        filter: 'Fruits & Vegetables',
        subcategories: ['All', 'Citrus', 'Tropical', 'Berries', 'Seasonal']
      },
      'dairy-products': { 
        name: 'Dairy & Eggs', 
        filter: 'Dairy & Eggs',
        subcategories: ['All', 'Milk & Cream', 'Cheese', 'Yogurt', 'Eggs']
      },
      'snacks-beverages': { 
        name: 'Snacks & Beverages', 
        filter: 'Snacks & Beverages',
        subcategories: ['All', 'Chips & Namkeen', 'Biscuits', 'Beverages', 'Chocolates']
      },
      'personal-care': { 
        name: 'Personal Care', 
        filter: 'Personal Care',
        subcategories: ['All', 'Skincare', 'Hair Care', 'Oral Care', 'Bath & Body']
      }
    };
    return categoryMap[slug] || { name: 'Category', filter: '', subcategories: ['All'] };
  };

  const categoryInfo = getCategoryInfo(categorySlug || '');
  
  // Filter products by category and subcategory
  const getFilteredProducts = () => {
    let filtered = products.filter(p => p.category === categoryInfo.filter);
    
    if (activeSubcategory !== 'all') {
      // Add more specific filtering logic here based on your product data structure
      // For now, just return all products in the category
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(activeSubcategory.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-3"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{categoryInfo.name}</h1>
                <p className="text-sm text-gray-500">{filteredProducts.length} items</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Subcategory Tabs */}
        <div className="mb-6">
          <Tabs value={activeSubcategory} onValueChange={setActiveSubcategory}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              {categoryInfo.subcategories.map((subcat) => (
                <TabsTrigger 
                  key={subcat.toLowerCase()} 
                  value={subcat.toLowerCase()}
                  className="text-xs sm:text-sm"
                >
                  {subcat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Products Grid */}
        <div className="mb-6">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  cartQuantity={getCartQuantity(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                {activeSubcategory === 'all' 
                  ? `No products available in ${categoryInfo.name} category.`
                  : `No products found in ${activeSubcategory} subcategory.`
                }
              </p>
              <Button 
                onClick={() => setActiveSubcategory('all')} 
                variant="outline"
              >
                View All {categoryInfo.name}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubCategoriesNew;