import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminLayout from './components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

type ProductRow = {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  discount: number | null;
  offer: string | null;
  image_url: string | null;
  stock_quantity: number | null;
  weight: string | null;
  delivery_time: string | null;
  description: string | null;
  categories?: { name: string };
};

const ManageProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Product fields for modal
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    category_id: '',
    discount: '',
    offer: '',
    image_url: '',
    stock_quantity: '',
    weight: '',
    delivery_time: '',
    description: ''
  });

  // Fetch products from supabase, now selecting new persistent "offer"
  const { data: products = [], refetch, isLoading } = useQuery<ProductRow[]>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, price, category_id, discount, offer, image_url, stock_quantity, weight, delivery_time, description,
          categories:category_id ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Failed to load products",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }
      return data || [];
    }
  });

  // Filtered products for search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle add/edit product modal show/hide
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddProduct(true);
  };
  
  const handleEditProduct = (product: ProductRow) => {
    setEditingProduct(product);
    setProductData({
      name: product.name,
      price: product.price.toString(),
      category_id: product.category_id?.toString() || '',
      discount: product.discount?.toString() || '',
      offer: product.offer || '',
      image_url: product.image_url || '',
      stock_quantity: product.stock_quantity?.toString() || '',
      weight: product.weight || '',
      delivery_time: product.delivery_time || '',
      description: product.description || ''
    });
    setShowAddProduct(true);
  };
  
  const handleCloseModal = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
    setProductData({
      name: '',
      price: '',
      category_id: '',
      discount: '',
      offer: '',
      image_url: '',
      stock_quantity: '',
      weight: '',
      delivery_time: '',
      description: ''
    });
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', productId);
    
    if (error) {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  };

  // Handle product field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit to Supabase (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    // Prepare payload
    const payload: any = {
      name: productData.name,
      price: Number(productData.price),
      category_id: productData.category_id ? Number(productData.category_id) : null,
      discount: productData.discount ? Number(productData.discount) : null,
      image_url: productData.image_url,
      stock_quantity: productData.stock_quantity ? Number(productData.stock_quantity) : null,
      weight: productData.weight,
      delivery_time: productData.delivery_time,
      description: productData.description,
      offer: productData.offer ?? null,
    };

    let error;
    if (editingProduct) {
      // Update existing product
      const result = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      error = result.error;
    } else {
      // Create new product
      const result = await supabase.from('products').insert([payload]);
      error = result.error;
    }
    
    setCreating(false);

    if (error) {
      toast({
        title: editingProduct ? "Product update failed" : "Product creation failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: editingProduct ? "Product updated!" : "Product added!",
        description: editingProduct ? "Successfully updated the product." : "Successfully created a new product.",
      });
      handleCloseModal();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Products Management</h1>
          <Button 
            onClick={handleAddProduct}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Product
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
        
        {/* Product table */}
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredProducts.length ? filteredProducts : products).map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {/* FIX: Only use product.image_url */}
                          <img className="h-10 w-10 rounded-sm object-cover" src={product.image_url} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">{product.categories?.name || '-'}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs {product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.stock_quantity > 100 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock_quantity > 30 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock_quantity || 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {product.discount ? <span className="text-red-600 font-bold">{product.discount}%</span> : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {/* Render offer (can be null), show dash otherwise */}
                      {typeof product.offer === "string" && product.offer.trim().length > 0
                        ? <span className="text-orange-600">{product.offer}</span>
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-800" onClick={handleCloseModal}>&#10005;</button>
              <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <Input name="name" placeholder="Product Name" value={productData.name} onChange={handleChange} required />
                <Input name="price" type="number" placeholder="Price" value={productData.price} onChange={handleChange} required min={0} />
                <Input name="discount" type="number" placeholder="Discount %" value={productData.discount} onChange={handleChange} min={0} max={99} />
                <Input name="offer" placeholder="Offer Description (optional)" value={productData.offer} onChange={handleChange} />
                <Input name="category_id" type="number" placeholder="Category id" value={productData.category_id} onChange={handleChange} required />
                <Input name="stock_quantity" type="number" placeholder="Stock Quantity" value={productData.stock_quantity} onChange={handleChange} min={0} />
                <Input name="weight" placeholder="Weight (e.g., 500g, 1kg)" value={productData.weight} onChange={handleChange} />
                <Input name="delivery_time" placeholder="Delivery Time" value={productData.delivery_time} onChange={handleChange} />
                <Input name="image_url" placeholder="Product Image URL" value={productData.image_url} onChange={handleChange} />
                <textarea name="description" placeholder="Description" value={productData.description} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 min-h-[60px]" />
                <Button className="w-full" type="submit" disabled={creating}>
                  {creating ? (editingProduct ? "Updating..." : "Adding...") : (editingProduct ? "Update Product" : "Add Product")}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageProducts;
