import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from './components/AdminLayout';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  image_url?: string;
  color_gradient?: string;
  product_count?: number;
  created_at: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  description?: string;
  created_at: string;
  categories?: { name: string };
}

const ManageCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    image_url: '',
    color_gradient: 'from-blue-400 to-blue-600'
  });

  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    category_id: '',
    description: ''
  });

  // Fetch categories
  const { data: categories = [], refetch: refetchCategories } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch subcategories
  const { data: subCategories = [], refetch: refetchSubCategories } = useQuery<SubCategory[]>({
    queryKey: ['admin-subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select(`
          id, name, category_id, description, created_at,
          categories:category_id ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', image_url: '', color_gradient: 'from-blue-400 to-blue-600' });
    setCategoryModalOpen(true);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      image_url: category.image_url || '',
      color_gradient: category.color_gradient || 'from-blue-400 to-blue-600'
    });
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async () => {
    setLoading(true);
    try {
      if (!categoryForm.name.trim()) {
        throw new Error('Category name is required');
      }

      const payload = {
        name: categoryForm.name.trim(),
        image_url: categoryForm.image_url || null,
        color_gradient: categoryForm.color_gradient,
        product_count: 0
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        toast({ title: "Category updated successfully!" });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([payload]);
        
        if (error) throw error;
        toast({ title: "Category added successfully!" });
      }

      setCategoryModalOpen(false);
      await refetchCategories();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    } catch (error: any) {
      toast({
        title: "Failed to save category",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This will also affect associated products.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({ title: "Category deleted successfully!" });
      await refetchCategories();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    } catch (error: any) {
      toast({
        title: "Failed to delete category",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // SubCategory handlers
  const handleAddSubCategory = () => {
    setEditingSubCategory(null);
    setSubCategoryForm({ name: '', category_id: '', description: '' });
    setSubCategoryModalOpen(true);
  };

  const handleSubCategorySubmit = async () => {
    setLoading(true);
    try {
      if (!subCategoryForm.name.trim() || !subCategoryForm.category_id) {
        throw new Error('Subcategory name and category are required');
      }

      const payload = {
        name: subCategoryForm.name.trim(),
        category_id: parseInt(subCategoryForm.category_id),
        description: subCategoryForm.description || null
      };

      if (editingSubCategory) {
        const { error } = await supabase
          .from('subcategories')
          .update(payload)
          .eq('id', editingSubCategory.id);
        
        if (error) throw error;
        toast({ title: "Subcategory updated successfully!" });
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert([payload]);
        
        if (error) throw error;
        toast({ title: "Subcategory added successfully!" });
      }

      setSubCategoryModalOpen(false);
      await refetchSubCategories();
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    } catch (error: any) {
      toast({
        title: "Failed to save subcategory",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout onRefresh={() => { refetchCategories(); refetchSubCategories(); }}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Categories & Subcategories</h1>
          <div className="flex gap-2">
            <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
            <Button onClick={handleAddSubCategory} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <React.Fragment key={category.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleCategoryExpansion(category.id)}
                            className="mr-2 p-1 hover:bg-gray-200 rounded"
                          >
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex items-center">
                            {category.image_url && (
                              <img 
                                src={category.image_url} 
                                alt={category.name}
                                className="h-8 w-8 rounded object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                              <div className="text-xs text-gray-500">ID: {category.id}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">{category.product_count || 0} products</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(category.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                    {expandedCategories.has(category.id) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-2 bg-gray-50">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-800">Subcategories</h4>
                              <Button 
                                variant="outline"
                                size="sm" 
                                onClick={() => {
                                  setEditingSubCategory(null);
                                  setSubCategoryForm({ name: '', category_id: category.id.toString(), description: '' });
                                  setSubCategoryModalOpen(true);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Subcategory
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {subCategories
                                .filter(sub => sub.category_id === category.id)
                                .map((subCategory) => (
                                  <div 
                                    key={subCategory.id} 
                                    className="flex items-center justify-between bg-white p-2 rounded border"
                                  >
                                    <div>
                                      <div className="text-xs font-medium">{subCategory.name}</div>
                                      {subCategory.description && (
                                        <div className="text-xs text-gray-500 truncate">{subCategory.description}</div>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          setEditingSubCategory(subCategory);
                                          setSubCategoryForm({
                                            name: subCategory.name,
                                            category_id: subCategory.category_id.toString(),
                                            description: subCategory.description || ''
                                          });
                                          setSubCategoryModalOpen(true);
                                        }}
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                        onClick={async () => {
                                          if (confirm('Delete this subcategory?')) {
                                            try {
                                              const { error } = await supabase
                                                .from('subcategories')
                                                .delete()
                                                .eq('id', subCategory.id);
                                              
                                              if (error) throw error;
                                              toast({ title: "Subcategory deleted successfully!" });
                                              refetchSubCategories();
                                            } catch (error: any) {
                                              toast({
                                                title: "Failed to delete subcategory",
                                                description: error.message,
                                                variant: "destructive"
                                              });
                                            }
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              {subCategories.filter(sub => sub.category_id === category.id).length === 0 && (
                                <div className="text-xs text-gray-500 col-span-full">No subcategories yet</div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Modal */}
        <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update category information' : 'Create a new category for products'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name *</Label>
                <Input
                  id="category-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category-image">Category Image</Label>
                <ImageUpload
                  onImageUpload={(url) => setCategoryForm(prev => ({ ...prev, image_url: url }))}
                  currentImage={categoryForm.image_url}
                  folder="categories"
                />
              </div>
              <div>
                <Label htmlFor="category-gradient">Color Gradient</Label>
                <Select 
                  value={categoryForm.color_gradient} 
                  onValueChange={(value) => setCategoryForm(prev => ({ ...prev, color_gradient: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="from-blue-400 to-blue-600">Blue</SelectItem>
                    <SelectItem value="from-green-400 to-green-600">Green</SelectItem>
                    <SelectItem value="from-purple-400 to-purple-600">Purple</SelectItem>
                    <SelectItem value="from-red-400 to-red-600">Red</SelectItem>
                    <SelectItem value="from-yellow-400 to-yellow-600">Yellow</SelectItem>
                    <SelectItem value="from-indigo-400 to-indigo-600">Indigo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCategorySubmit} disabled={loading}>
                {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SubCategory Modal */}
        <Dialog open={subCategoryModalOpen} onOpenChange={setSubCategoryModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubCategory ? 'Edit Subcategory' : 'Add New Subcategory'}
              </DialogTitle>
              <DialogDescription>
                Subcategories help organize products within categories
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subcategory-name">Subcategory Name *</Label>
                <Input
                  id="subcategory-name"
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter subcategory name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="parent-category">Parent Category *</Label>
                <Select 
                  value={subCategoryForm.category_id} 
                  onValueChange={(value) => setSubCategoryForm(prev => ({ ...prev, category_id: value }))}
                >
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
                <Label htmlFor="subcategory-description">Description</Label>
                <Textarea
                  id="subcategory-description"
                  value={subCategoryForm.description}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this subcategory"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubCategorySubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ManageCategories;