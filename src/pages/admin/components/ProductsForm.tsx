import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SingleImageUpload from "@/components/admin/SingleImageUpload";
import MultipleImageUpload from "@/components/admin/MultipleImageUpload";

interface ProductFormProps {
  value: any;
  categories: any[];
  subcategories: any[];
  loading: boolean;
  isEdit: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onImageChange: (url: string) => void;
  onImagesChange: (urls: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ProductForm = ({
  value,
  categories,
  subcategories,
  loading,
  isEdit,
  onChange,
  onImageChange,
  onImagesChange,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label>Product Name</Label>
          <Input name="name" value={value.name} onChange={onChange} required />

          <Label>Price</Label>
          <Input
            name="price"
            value={value.price}
            onChange={onChange}
            required
          />

          <Label>Original Price</Label>
          <Input
            name="original_price"
            value={value.original_price}
            onChange={onChange}
          />

          <Label>Stock Quantity</Label>
          <Input
            name="stock_quantity"
            value={value.stock_quantity}
            onChange={onChange}
          />

          <Label>Category</Label>
          <select
            name="category_id"
            value={value.category_id}
            onChange={(e: any) => onChange(e)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Label>Subcategory</Label>
          <select
            name="subcategory_id"
            value={value.subcategory_id}
            onChange={(e: any) => onChange(e)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select subcategory</option>
            {subcategories
              .filter((s) => String(s.category_id) === value.category_id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>

        <div className="space-y-3">
          <Label>Delivery Time</Label>
          <Input
            name="delivery_time"
            value={value.delivery_time}
            onChange={onChange}
          />

          <Label>Weight</Label>
          <Input name="weight" value={value.weight} onChange={onChange} />

          <Label>Offer Text</Label>
          <Input name="offer" value={value.offer} onChange={onChange} />

          <Label>Main Image</Label>
          <SingleImageUpload
            currentImage={value.image_url}
            onImageUpload={onImageChange}
          />

          <Label>Gallery Images</Label>
          <MultipleImageUpload
            currentImages={value.image_urls}
            onImagesUpload={onImagesChange}
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <textarea
          name="description"
          value={value.description}
          onChange={onChange}
          className="w-full min-h-[100px] border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? isEdit
              ? "Updating..."
              : "Adding..."
            : isEdit
            ? "Update Product"
            : "Add Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
