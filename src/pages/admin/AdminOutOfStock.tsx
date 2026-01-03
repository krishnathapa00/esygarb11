import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ProductForm from "./components/ProductsForm";
import { Button } from "@/components/ui/button";

const fetchOutOfStockProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("stock_quantity", 0)
    .order("name");

  if (error) throw error;
  return data || [];
};

const AdminOutOfStock = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["out-of-stock-products"],
    queryFn: fetchOutOfStockProducts,
  });

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

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Out of Stock Products</h1>

        {isLoading && <p>Loading...</p>}

        {!isLoading && data?.length === 0 && (
          <p className="text-gray-500">All products are in stock 🎉</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.map((product) => (
            <Card key={product.id} className="p-2">
              <CardHeader className="p-2">
                <CardTitle className="text-sm truncate">
                  {product.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-2 space-y-2">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-28 object-contain bg-gray-100 rounded"
                  />
                )}

                <p className="text-xs text-gray-500 truncate">
                  ID: {product.id}
                </p>

                <p className="text-sm text-red-600 font-semibold">
                  Stock: {product.stock_quantity}
                </p>
                <Button
                  size="sm"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  onClick={() => {
                    setEditingProduct(product);
                    setProductData({
                      name: product.name,
                      price: product.price?.toString() || "",
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
                    setShowModal(true);
                  }}
                >
                  Add Stock
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 md:p-6">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold z-10"
                onClick={() => setShowModal(false)}
              >
                &#10005;
              </button>

              <h2 className="text-2xl font-bold mb-6 text-center">
                Add Stock for {editingProduct?.name}
              </h2>

              <ProductForm
                value={productData}
                categories={[]} // not needed for stock update
                subcategories={[]} // not needed
                loading={false}
                isEdit={true}
                onChange={(e) => {
                  setProductData({
                    ...productData,
                    [e.target.name]: e.target.value,
                  });
                }}
                onImageChange={() => {}}
                onImagesChange={() => {}}
                onSubmit={async (e) => {
                  e.preventDefault();

                  const { error } = await supabase
                    .from("products")
                    .update({
                      stock_quantity: Number(productData.stock_quantity),
                    })
                    .eq("id", editingProduct.id);

                  if (error) {
                    toast({
                      title: "Failed to update stock",
                      description: error.message,
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Stock updated!",
                      description: `${productData.name} stock is now ${productData.stock_quantity}`,
                    });
                    setShowModal(false);
                    setEditingProduct(null);
                    queryClient.invalidateQueries({
                      queryKey: ["out-of-stock-products"],
                    });
                  }
                }}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOutOfStock;
