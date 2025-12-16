import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

type CategoryJoin = {
  name: string;
};

export type ProductRow = {
  id: number;
  name: string;
  price: number;
  original_price: number;
  category_id: number | null;
  subcategory_id: number | null;
  discount: number | null;
  offer: string | null;
  image_url: string | null;
  image_urls?: string[] | null;
  stock_quantity: number | null;
  weight: string | null;
  delivery_time: string | null;
  description: string | null;
  is_active?: boolean;
  categories?: CategoryJoin | CategoryJoin[] | null;
};

type Props = {
  products: ProductRow[];
  isLoading: boolean;
  onEdit: (p: ProductRow) => void;
  onDelete: (id: number) => void;
};

const DesktopProductsList = ({
  products,
  isLoading,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <div className="bg-white shadow rounded-lg hidden md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Product",
                "Category",
                "Price",
                "Stock",
                "Discount",
                "Offer",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url ?? "/placeholder.png"}
                        className="h-10 w-10 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant="secondary">
                      {Array.isArray(product.categories)
                        ? product.categories[0]?.name
                        : product.categories?.name || "-"}
                    </Badge>
                  </td>

                  <td className="px-6 py-4">Rs{product.price}</td>

                  <td className="px-6 py-4">{product.stock_quantity ?? 0}</td>

                  <td className="px-6 py-4 text-center">
                    {product.discount ? `${product.discount}%` : "-"}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {product.offer || "-"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => onDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesktopProductsList;
