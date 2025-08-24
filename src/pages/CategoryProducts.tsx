import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useCartActions } from '@/hooks/useCart';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { handleAddToCart, handleUpdateQuantity, getCartQuantity } = useCartActions();

  // Convert URL slug back to category name
  const getCategoryDisplayName = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryDisplayName = getCategoryDisplayName(categoryName || '');
  
  // Filter products by category name (exact match or contains)
  const filteredProducts = products.filter(product => {
    const productCategory = product.category?.toLowerCase() || '';
    const searchCategory = categoryDisplayName.toLowerCase();
    
    return productCategory.includes(searchCategory) || 
           searchCategory.includes(productCategory) ||
           product.name.toLowerCase().includes(searchCategory);
  });

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
                <h1 className="text-xl font-bold text-gray-900">{categoryDisplayName}</h1>
                <p className="text-sm text-gray-500">{filteredProducts.length} items available</p>
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
        {/* Products Grid */}
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
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              No products available in the {categoryDisplayName} category at the moment.
            </p>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
            >
              Browse All Categories
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;