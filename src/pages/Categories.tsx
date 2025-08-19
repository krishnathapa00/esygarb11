import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ArrowLeft, Clock, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: number;
  name: string;
  image_url?: string;
  color_gradient?: string;
  product_count?: number;
}

const AllCategories = () => {
  // Fetch categories from database
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 text-sm mt-1">Shop by category</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <Package className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-700">{totalProducts}</div>
            <div className="text-xs text-green-600">Products</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <Truck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-700">Free</div>
            <div className="text-xs text-blue-600">Delivery</div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 text-center">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-700">10 min</div>
            <div className="text-xs text-purple-600">Delivery</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="flex items-center justify-center mb-3">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  ) : (
                    <div className={`w-32 h-32 rounded-xl bg-gradient-to-br ${category.color_gradient || 'from-blue-400 to-blue-600'} flex items-center justify-center`}>
                      <Package className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {category.product_count || 0} items
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories available</h3>
            <p className="text-gray-500">Categories will appear here once they are added by the admin.</p>
          </div>
        )}
      </div>
      
      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default AllCategories;