import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useCartActions } from '@/hooks/useCart';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import { useIsMobile } from '@/hooks/use-mobile';

const SubCategoriesMobile = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { handleAddToCart, handleUpdateQuantity, getCartQuantity } = useCartActions();
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const isMobile = useIsMobile();

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
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(activeSubcategory.toLowerCase()) ||
        p.category?.toLowerCase().includes(activeSubcategory.toLowerCase())
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

      <div className="flex min-h-screen">
        {/* Left Sidebar - Subcategory Filters (Mobile) */}
        <div className={`${isMobile ? 'w-24' : 'w-48'} bg-white border-r border-gray-200 shadow-sm`}>
          <div className="p-4">
            <h3 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-xs text-center' : 'text-sm'}`}>
              {isMobile ? 'Filters' : 'Categories'}
            </h3>
            <div className="space-y-2">
              {categoryInfo.subcategories.map((subcat) => (
                <button
                  key={subcat.toLowerCase()}
                  onClick={() => setActiveSubcategory(subcat.toLowerCase())}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeSubcategory === subcat.toLowerCase()
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  } ${isMobile ? 'text-center px-1' : ''}`}
                >
                  {isMobile ? subcat.slice(0, 4) : subcat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Products Grid */}
        <div className="flex-1 p-4">
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-4 ${
              isMobile 
                ? 'grid-cols-2' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}>
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 overflow-hidden"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                    {product.discount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-gray-900">
                            NPR {product.price}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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

export default SubCategoriesMobile;