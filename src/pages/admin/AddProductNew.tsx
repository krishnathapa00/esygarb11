import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from './components/AdminLayout';
import MultipleImageUpload from '@/components/MultipleImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

const AddProductNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    original_price: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    subcategory_id: '',
    image_urls: [] as string[],
    weight: '',
    delivery_time: '10-15 mins',
    offer: '',
    discount: ''
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch subcategories for selected category
  const { data: subcategories = [] } = useQuery({
    queryKey: ['subcategories', productData.category_id],
    queryFn: async () => {
      if (!productData.category_id) return [];
      
      const { data, error } = await supabase
        .from('subcategories')
        .select('id, name')
        .eq('category_id', parseInt(productData.category_id))
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!productData.category_id
  });

  const handleInputChange = (field: string, value: string) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagesUpload = (urls: string[]) => {
    setProductData(prev => ({
      ...prev,
      image_urls: urls
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!productData.name || !productData.price || !productData.category_id) {
        throw new Error('Please fill in all required fields');
      }

      if (productData.image_urls.length === 0) {
        throw new Error('Please upload at least one product image');
      }

      const payload = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        original_price: productData.original_price ? Number(productData.original_price) : null,
        stock_quantity: productData.stock_quantity ? Number(productData.stock_quantity) : 0,
        category_id: Number(productData.category_id),
        subcategory_id: productData.subcategory_id ? Number(productData.subcategory_id) : null,
        image_url: productData.image_urls[0], // Main image
        weight: productData.weight,
        delivery_time: productData.delivery_time,
        offer: productData.offer || null,
        discount: productData.discount ? Number(productData.discount) : null,
        is_active: true
      };

      const { data: product, error } = await supabase
        .from('products')
        .insert([payload])
        .select('id')
        .single();

      if (error) throw error;

      // Store additional images in a separate table if needed
      // For now, we'll just use the first image as the main image

      toast({
        title: "Product Added Successfully!",
        description: `Product created with ${productData.image_urls.length} image(s)`
      });

      navigate('/admin/products');
    } catch (error: any) {
      toast({
        title: "Failed to Add Product",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin/products')}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <p className="text-gray-500">Create a new product with multiple images</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={productData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => {
                        handleInputChange('category_id', value);
                        handleInputChange('subcategory_id', ''); // Reset subcategory
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select 
                        onValueChange={(value) => handleInputChange('subcategory_id', value)}
                        disabled={!productData.category_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {subcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={productData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Product description"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="original_price">Original Price (MRP)</Label>
                      <Input
                        id="original_price"
                        type="number"
                        value={productData.original_price}
                        onChange={(e) => handleInputChange('original_price', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Selling Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={productData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock_quantity">Stock Quantity</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        value={productData.stock_quantity}
                        onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={productData.discount}
                        onChange={(e) => handleInputChange('discount', e.target.value)}
                        placeholder="0"
                        min="0"
                        max="99"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight/Size</Label>
                    <Input
                      id="weight"
                      value={productData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="e.g., 500g, 1kg, 250ml"
                    />
                  </div>

                  <div>
                    <Label htmlFor="offer">Special Offer</Label>
                    <Input
                      id="offer"
                      value={productData.offer}
                      onChange={(e) => handleInputChange('offer', e.target.value)}
                      placeholder="e.g., Buy 2 Get 1 Free"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <MultipleImageUpload
                    onImagesUpload={handleImagesUpload}
                    currentImages={productData.image_urls}
                    maxImages={3}
                    folder="products"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="delivery_time">Delivery Time</Label>
                    <Select onValueChange={(value) => handleInputChange('delivery_time', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10-15 mins">10-15 minutes</SelectItem>
                        <SelectItem value="15-30 mins">15-30 minutes</SelectItem>
                        <SelectItem value="30-45 mins">30-45 minutes</SelectItem>
                        <SelectItem value="45-60 mins">45-60 minutes</SelectItem>
                        <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Product
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/admin/products')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddProductNew;