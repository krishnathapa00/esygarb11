import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminLayout from "./components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import PaginationControls from "@/components/PaginationControls";
import DesktopProductsList, {
  ProductRow,
} from "./components/DesktopProductsList";
import MobileProductsList from "./components/MobileProductsList";
import ProductForm from "./components/ProductsForm";

const ManageProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Product fields for modal
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    original_price: "",
    category_id: "",
    subcategory_id: "",
    discount: "",
    offer: "",
    image_url: "",
    image_urls: [],
    stock_quantity: "",
    weight: "",
    delivery_time: "",
    description: "",
  });

  // Pagination Setup
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data: totalCount = 0 } = useQuery({
    queryKey: ["admin-products-count", searchTerm],
    queryFn: async () => {
      let countQuery = supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (searchTerm.trim()) {
        countQuery = countQuery.ilike("name", `%${searchTerm.trim()}%`);
      }

      const { count, error } = await countQuery;

      if (error) {
        console.error("Count error:", error);
        return 0;
      }

      return count || 0;
    },
  });

  // Fetch products from supabase
  const {
    data: products = [],
    refetch,
    isLoading,
  } = useQuery<ProductRow[]>({
    queryKey: ["admin-products", currentPage, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(
          `
          id, name, price, original_price, category_id, subcategory_id, discount, offer, image_url, image_urls, stock_quantity, weight, delivery_time, description, is_active,
          categories:category_id ( name )
        `
        )
        .range(from, to)
        .order("created_at", { ascending: false });

      if (searchTerm.trim()) {
        query = query.ilike("name", `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        toast({ title: "Error loading products", description: error.message });
        return [];
      }

      // Normalize the categories field to always be an array for consistent typing
      const normalizedData = (data || []).map((product) => ({
        ...product,
        categories: Array.isArray(product.categories)
          ? product.categories
          : product.categories
          ? [product.categories]
          : null,
      })) as ProductRow[];

      return normalizedData;
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch subcategories (if it exists in your schema)
  const { data: subcategories = [] } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name, category_id");
      if (error) throw error;
      return data;
    },
  });

  // Handle add product modal show/hide
  const handleAddProduct = () => navigate("/admin/add-product-new");
  const handleCloseModal = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
    setProductData({
      name: "",
      price: "",
      original_price: "",
      category_id: "",
      subcategory_id: "",
      discount: "",
      offer: "",
      image_url: "",
      image_urls: [],
      stock_quantity: "",
      weight: "",
      delivery_time: "",
      description: "",
    });
  };

  // Handle product field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    // Prepare payload
    const payload: any = {
      name: productData.name,
      price: Number(productData.price),
      original_price: productData.original_price
        ? Number(productData.original_price)
        : null,
      category_id: productData.category_id
        ? Number(productData.category_id)
        : null,
      subcategory_id: productData.subcategory_id
        ? Number(productData.subcategory_id)
        : null,
      discount: productData.discount ? Number(productData.discount) : null,
      image_url: productData.image_url,
      image_urls: productData.image_urls,
      stock_quantity: productData.stock_quantity
        ? Number(productData.stock_quantity)
        : null,
      weight: productData.weight,
      delivery_time: productData.delivery_time,
      description: productData.description,
      offer: productData.offer ?? null,
    };

    let error;
    if (editingProduct) {
      // Update existing product
      const result = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id);
      error = result.error;
    } else {
      // Create new product
      const result = await supabase.from("products").insert([payload]);
      error = result.error;
    }

    setCreating(false);

    if (error) {
      toast({
        title: editingProduct
          ? "Product update failed"
          : "Product creation failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: editingProduct ? "Product updated!" : "Product added!",
        description: editingProduct
          ? "Successfully updated the product."
          : "Successfully created a new product.",
      });
      handleCloseModal();
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    }
  };

  // Handle edit product
  const handleEditProduct = (product: ProductRow) => {
    setEditingProduct(product);
    setProductData({
      name: product.name,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      category_id: product.category_id?.toString() || "",
      subcategory_id: product.subcategory_id?.toString() || "",
      discount: product.discount?.toString() || "",
      offer: product.offer || "",
      image_url: product.image_url || "",
      image_urls: product.image_urls || [],
      stock_quantity: product.stock_quantity?.toString() || "",
      weight: product.weight || "",
      delivery_time: product.delivery_time || "",
      description: product.description || "",
    });
    setShowAddProduct(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;

    try {
      console.log("Attempting to delete product:", productId);

      // First check if user has admin permissions - get session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated - please log in again");
      }

      // Attempt direct deletion with proper error handling
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        console.error("Delete error details:", error);

        // Handle specific error cases
        if (error.code === "23503") {
          throw new Error(
            "Cannot delete product - it has associated orders. Archive the product instead."
          );
        } else if (error.code === "42501") {
          throw new Error(
            "Permission denied - only admins can delete products"
          );
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      console.log("Product deleted successfully:", productId);

      toast({
        title: "Product deleted!",
        description: "Product has been permanently removed.",
      });

      // Force refetch and invalidate queries
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error: any) {
      console.error("Delete operation failed:", error);
      toast({
        title: "Delete failed",
        description:
          error.message ||
          "Failed to delete product. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Products Management</h1>
          <Button
            onClick={handleAddProduct}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex justify-center sm:justify-start"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Product
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto flex justify-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Product List */}
        <DesktopProductsList
          products={products}
          isLoading={isLoading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
        <MobileProductsList
          products={products}
          isLoading={isLoading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />

        {/* Pagination */}
        <div className="flex justify-center md:justify-end">
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / itemsPerPage)}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-4 md:p-6">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold z-10"
                onClick={handleCloseModal}
              >
                &#10005;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>

              <ProductForm
                value={productData}
                categories={categories}
                subcategories={subcategories}
                loading={creating}
                isEdit={!!editingProduct}
                onChange={handleChange}
                onImageChange={(url) =>
                  setProductData((p) => ({ ...p, image_url: url }))
                }
                onImagesChange={(urls) =>
                  setProductData((p) => ({ ...p, image_urls: urls }))
                }
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageProducts;

