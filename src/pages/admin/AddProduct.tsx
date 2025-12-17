import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "./components/AdminLayout";
import ImageUpload from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [productData, setProductData] = useState({
    name: "",
    brand_name: "",
    short_description: "",
    description: "",
    original_price: "",
    price: "",
    stock_quantity: "",
    unit_of_measurement: "piece",
    minimum_order_quantity: "1",
    category_id: "",
    image_url: "",
    tags: "",
    is_vegetarian: false,
    is_gluten_free: false,
    is_organic: false,
    delivery_time: "10 mins",
    weight: "",
    offer: "",
    discount: "",
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!productData.name || !productData.price || !productData.category_id) {
        throw new Error("Please fill in all required fields");
      }

      const payload = {
        name: productData.name,
        description: productData.description || productData.short_description,
        price: Number(productData.price),
        original_price: productData.original_price
          ? Number(productData.original_price)
          : null,
        stock_quantity: productData.stock_quantity
          ? Number(productData.stock_quantity)
          : 0,
        category_id: Number(productData.category_id),
        image_url: productData.image_url,
        weight: productData.weight,
        delivery_time: productData.delivery_time,
        offer: productData.offer || null,
        discount: productData.discount ? Number(productData.discount) : null,
        is_active: true,
      };

      const { error } = await supabase.from("products").insert([payload]);

      if (error) throw error;

      toast({
        title: "Product Added Successfully!",
        description: "The product has been added to your catalog.",
      });

      navigate("/admin/products");
    } catch (error: any) {
      toast({
        title: "Failed to Add Product",
        description: error.message,
        variant: "destructive",
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
            onClick={() => navigate("/admin/products")}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <p className="text-gray-500">Create a new product for your store</p>
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
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand Name</Label>
                    <Input
                      id="brand"
                      value={productData.brand_name}
                      onChange={(e) =>
                        handleInputChange("brand_name", e.target.value)
                      }
                      placeholder="Enter brand name (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        onValueChange={(value) =>
                          handleInputChange("category_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select
                        onValueChange={(value) =>
                          handleInputChange("subcategory_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {/* Subcategories would be filtered by selected category */}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="short_description">Short Description</Label>
                    <Input
                      id="short_description"
                      value={productData.short_description}
                      onChange={(e) =>
                        handleInputChange("short_description", e.target.value)
                      }
                      placeholder="Brief description (100-150 characters)"
                      maxLength={150}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {productData.short_description.length}/150 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                      id="description"
                      value={productData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Detailed product description"
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
                      <Label htmlFor="original_price">
                        Original Price (MRP)
                      </Label>
                      <Input
                        id="original_price"
                        type="number"
                        value={productData.original_price}
                        onChange={(e) =>
                          handleInputChange("original_price", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleInputChange("stock_quantity", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit of Measurement</Label>
                      <Select
                        onValueChange={(value) =>
                          handleInputChange("unit_of_measurement", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="gram">Gram</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="ml">Milliliter</SelectItem>
                          <SelectItem value="dozen">Dozen</SelectItem>
                          <SelectItem value="pack">Pack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight/Size</Label>
                    <Input
                      id="weight"
                      value={productData.weight}
                      onChange={(e) =>
                        handleInputChange("weight", e.target.value)
                      }
                      placeholder="e.g., 500g, 1kg, 250ml"
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_order">Minimum Order Quantity</Label>
                    <Input
                      id="min_order"
                      type="number"
                      value={productData.minimum_order_quantity}
                      onChange={(e) =>
                        handleInputChange(
                          "minimum_order_quantity",
                          e.target.value
                        )
                      }
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags & Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tags">Search Tags</Label>
                    <Input
                      id="tags"
                      value={productData.tags}
                      onChange={(e) =>
                        handleInputChange("tags", e.target.value)
                      }
                      placeholder="organic, fresh, local (comma separated)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="offer">Special Offer</Label>
                    <Input
                      id="offer"
                      value={productData.offer}
                      onChange={(e) =>
                        handleInputChange("offer", e.target.value)
                      }
                      placeholder="e.g., Buy 2 Get 1 Free"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Product Properties</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={productData.is_vegetarian}
                          onChange={(e) =>
                            handleInputChange("is_vegetarian", e.target.checked)
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Vegetarian</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={productData.is_gluten_free}
                          onChange={(e) =>
                            handleInputChange(
                              "is_gluten_free",
                              e.target.checked
                            )
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Gluten-Free</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={productData.is_organic}
                          onChange={(e) =>
                            handleInputChange("is_organic", e.target.checked)
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Organic</span>
                      </label>
                    </div>
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
                  <ImageUpload
                    onImageUpload={(url) => handleInputChange("image_url", url)}
                    currentImage={productData.image_url}
                    folder="products"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload product images directly. First image will be the main
                    display.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="delivery_time">
                      Delivery Time Estimation
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("delivery_time", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10 mins">10 minutes</SelectItem>
                        <SelectItem value="15-30 mins">
                          15-30 minutes
                        </SelectItem>
                        <SelectItem value="30-45 mins">
                          30-45 minutes
                        </SelectItem>
                        <SelectItem value="45-60 mins">
                          45-60 minutes
                        </SelectItem>
                        <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                        <SelectItem value="Same day">Same day</SelectItem>
                        <SelectItem value="Next day">Next day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="in_stock"
                        name="stock_status"
                        checked={true}
                        readOnly
                      />
                      <Label htmlFor="in_stock">In Stock</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Product will be active and available for purchase
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
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
                  onClick={() => navigate("/admin/products")}
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

export default AddProduct;

