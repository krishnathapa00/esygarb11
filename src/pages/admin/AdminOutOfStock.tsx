import AdminLayout from "./components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  const { data, isLoading } = useQuery({
    queryKey: ["out-of-stock-products"],
    queryFn: fetchOutOfStockProducts,
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOutOfStock;
