import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, Star, Tag, Package } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "./components/AdminLayout";
import MultipleImageUpload from "@/components/MultipleImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
}

const AddProductNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const [productData, setProductData] = useState({
    name: "",
    category_id: "",
    subcategory_id: "",
    description: "",
    price: "",
    original_price: "",
    stock_quantity: "",
    weight: "",
    discount: "",
    offer: "",
    delivery_time: "10 mins",
    status: true,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
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

  // Fetch subcategories based on selected category
  const { data: subCategories = [] } = useQuery<SubCategory[]>({
    queryKey: ["subcategories", productData.category_id],
    queryFn: async () => {
      if (!productData.category_id) return [];

      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name, category_id")
        .eq("category_id", parseInt(productData.category_id))
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!productData.category_id,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (urls: string[]) => {
    setSelectedImages(urls);
    if (urls.length > 0 && mainImageIndex >= urls.length) {
      setMainImageIndex(0);
    }
  };

  const handleSaveProduct = async (isDraft: boolean = false) => {
    setLoading(true);
    try {
      // Validate required fields
      if (!productData.name || !productData.price || !productData.category_id) {
        throw new Error(
          "Please fill in all required fields (Name, Price, Category)"
        );
      }

      if (selectedImages.length === 0) {
        throw new Error("Please upload at least one product image");
      }

      const payload = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        original_price: productData.original_price
          ? Number(productData.original_price)
          : null,
        stock_quantity: productData.stock_quantity
          ? Number(productData.stock_quantity)
          : 0,
        category_id: Number(productData.category_id),
        subcategory_id: productData.subcategory_id
          ? Number(productData.subcategory_id)
          : null,
        image_url: selectedImages[mainImageIndex], // Main image
        image_urls: selectedImages,
        weight: productData.weight || null,
        delivery_time: productData.delivery_time,
        offer: productData.offer || null,
        discount: productData.discount ? Number(productData.discount) : null,
        is_active: productData.status && !isDraft,
      };

      const { error } = await supabase.from("products").insert([payload]);

      if (error) throw error;

      toast({
        title: isDraft
          ? "Product Saved as Draft!"
          : "Product Published Successfully!",
        description: isDraft
          ? "The product has been saved as draft."
          : "The product is now live and available for purchase.",
      });

      navigate("/admin/products");
    } catch (error: any) {
      toast({
        title: "Failed to Save Product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductData({
      name: "",
      category_id: "",
      subcategory_id: "",
      description: "",
      price: "",
      original_price: "",
      stock_quantity: "",
      weight: "",
      discount: "",
      offer: "",
      delivery_time: "10 mins",
      status: true,
    });
    setSelectedImages([]);
    setMainImageIndex(0);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
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
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground mt-1">
              Create a new product for your store
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={productData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        handleInputChange("category_id", value);
                        handleInputChange("subcategory_id", ""); // Reset subcategory when category changes
                      }}
                      value={productData.category_id}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Label
                      htmlFor="subcategory"
                      className="text-sm font-medium"
                    >
                      Subcategory
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("subcategory_id", value)
                      }
                      value={productData.subcategory_id}
                      disabled={!productData.category_id}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={
                            !productData.category_id
                              ? "Select category first"
                              : "Select subcategory"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.map((subCategory) => (
                          <SelectItem
                            key={subCategory.id}
                            value={subCategory.id.toString()}
                          >
                            {subCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Product Description
                  </Label>
                  <Textarea
                    id="description"
                    value={productData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Detailed product description"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="weight" className="text-sm font-medium">
                    Weight/Size
                  </Label>
                  <Input
                    id="weight"
                    value={productData.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    placeholder="e.g., 500g, 1kg, 250ml"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Pricing & Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="original_price"
                      className="text-sm font-medium"
                    >
                      Original Price (MRP)
                    </Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={productData.original_price}
                      onChange={(e) =>
                        handleInputChange("original_price", e.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">
                      Selling Price <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={productData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="stock_quantity"
                      className="text-sm font-medium"
                    >
                      Stock Quantity <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={productData.stock_quantity}
                      onChange={(e) =>
                        handleInputChange("stock_quantity", e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount" className="text-sm font-medium">
                      Discount (%)
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      value={productData.discount}
                      onChange={(e) =>
                        handleInputChange("discount", e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      max="100"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Offers */}
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-yellow-500" />
                  Special Offers & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="offer" className="text-sm font-medium">
                    Special Offer
                  </Label>
                  <Input
                    id="offer"
                    value={productData.offer}
                    onChange={(e) => handleInputChange("offer", e.target.value)}
                    placeholder="e.g., Buy 2 Get 1 Free, Limited Time Offer"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="delivery_time"
                    className="text-sm font-medium"
                  >
                    Delivery Time
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("delivery_time", value)
                    }
                    value={productData.delivery_time}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10 mins">10 minutes</SelectItem>
                      <SelectItem value="15-30 mins">15-30 minutes</SelectItem>
                      <SelectItem value="30-45 mins">30-45 minutes</SelectItem>
                      <SelectItem value="45-60 mins">45-60 minutes</SelectItem>
                      <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                      <SelectItem value="Same day">Same day</SelectItem>
                      <SelectItem value="Next day">Next day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Images & Settings */}
          <div className="space-y-6">
            {/* Product Images */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-500" />
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MultipleImageUpload
                  onImagesUpload={handleImageUpload}
                  currentImages={selectedImages}
                  maxImages={5}
                  folder="products"
                />
                {selectedImages.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">
                      Select Main Image
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedImages.map((url, index) => (
                        <div
                          key={index}
                          className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            mainImageIndex === index
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setMainImageIndex(index)}
                        >
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                          {mainImageIndex === index && (
                            <div className="absolute top-1 right-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          )}
                          <div className="absolute bottom-1 left-1">
                            <Badge variant="secondary" className="text-xs">
                              {index + 1}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status & Settings */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Status & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Product Status
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Active products are visible to customers
                    </p>
                  </div>
                  <Switch
                    checked={productData.status}
                    onCheckedChange={(checked) =>
                      handleInputChange("status", checked)
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Availability Locations
                  </Label>
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      New-Baneshwor (Default)
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Currently only available in New-Baneshwor
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleSaveProduct(false)}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publishing...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Publish
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleSaveProduct(true)}
                disabled={loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Save as Draft
              </Button>

              <Button
                onClick={resetForm}
                variant="ghost"
                className="w-full"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddProductNew;
