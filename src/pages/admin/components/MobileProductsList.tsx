import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { ProductRow } from "./DesktopProductsList";

type Props = {
  products: ProductRow[];
  isLoading: boolean;
  onEdit: (p: ProductRow) => void;
  onDelete: (id: number) => void;
};

const MobileProductsList = ({
  products,
  isLoading,
  onEdit,
  onDelete,
}: Props) => {
  if (isLoading) {
    return <p className="text-center py-6">Loading...</p>;
  }

  if (products.length === 0) {
    return <p className="text-center py-6">No products found.</p>;
  }

  return (
    <div className="space-y-4 md:hidden">
      {products.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl shadow-sm border p-4 space-y-3"
        >
          <div className="flex gap-3">
            <img
              src={p.image_url ?? "/placeholder.png"}
              className="h-14 w-14 rounded object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{p.name}</h3>
              <p className="text-xs text-gray-500">Rs{p.price}</p>
              <p className="text-xs">Stock: {p.stock_quantity ?? 0}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(p)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-red-600"
              onClick={() => onDelete(p.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileProductsList;
