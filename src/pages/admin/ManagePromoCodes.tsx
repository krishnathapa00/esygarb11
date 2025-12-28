import React, { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AdminLayout from "./components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  category_ids?: string[];
  product_ids?: string[];
}

const ManagePromoCodes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(false);

  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<
    { id: number; name: string }[]
  >([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [promoForm, setPromoForm] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_amount: "",
    max_discount_amount: "",
    usage_limit: "",
    expiry_date: "",
    is_active: true,
    category_ids: [],
    product_ids: [],
  });

  // Fetch promo codes
  const { data: promoCodes = [], refetch } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

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

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (productSearch.length === 0) {
      setFilteredProducts([]);
      return;
    }

    const lower = productSearch.toLowerCase();
    const results = products.filter((p) =>
      p.name.toLowerCase().includes(lower)
    );
    setFilteredProducts(results);
  }, [productSearch, products]);

  const filteredPromoCodes = (promoCodes || []).filter((promo: any) =>
    promo.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingPromo(null);
    setPromoForm({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "",
      max_discount_amount: "",
      usage_limit: "",
      expiry_date: "",
      is_active: true,
      category_ids: [],
      product_ids: [],
    });
    setModalOpen(true);
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      discount_type: promo.discount_type as "percentage" | "fixed",
      discount_value: promo.discount_value.toString(),
      min_order_amount: promo.min_order_amount?.toString() || "",
      max_discount_amount: promo.max_discount_amount?.toString() || "",
      usage_limit: promo.usage_limit?.toString() || "",
      expiry_date: promo.expires_at ? promo.expires_at.split("T")[0] : "",
      is_active: promo.is_active,
      category_ids: promo.category_ids || [],
      product_ids: promo.product_ids || [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!promoForm.code.trim() || !promoForm.discount_value) {
        throw new Error("Code and discount value are required");
      }

      const payload = {
        code: promoForm.code.trim().toUpperCase(),
        discount_type: promoForm.discount_type,
        discount_value: parseFloat(promoForm.discount_value),
        min_order_amount: promoForm.min_order_amount
          ? parseFloat(promoForm.min_order_amount)
          : null,
        max_discount_amount: promoForm.max_discount_amount
          ? parseFloat(promoForm.max_discount_amount)
          : null,
        usage_limit: promoForm.usage_limit
          ? parseInt(promoForm.usage_limit)
          : null,
        expires_at: promoForm.expiry_date || null,
        is_active: promoForm.is_active,
        used_count: 0,
        category_ids:
          promoForm.category_ids.length > 0 ? promoForm.category_ids : null,
        product_ids:
          promoForm.product_ids?.length > 0 ? promoForm.product_ids : null,
      };

      if (editingPromo) {
        const { error } = await supabase
          .from("promo_codes")
          .update({
            ...payload,
            used_count: editingPromo.used_count,
          })

          .eq("id", editingPromo.id);

        if (error) throw error;
        toast({ title: "Promo code updated successfully!" });
      } else {
        const { error } = await supabase
          .from("promo_codes")
          .insert([{ ...payload, name: payload.code }]);

        if (error) throw error;
        toast({ title: "Promo code created successfully!" });
      }

      setModalOpen(false);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Failed to save promo code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promoId: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("promo_codes")
        .delete()
        .eq("id", promoId);

      if (error) throw error;

      toast({ title: "Promo code deleted successfully!" });
      await refetch();
    } catch (error: any) {
      toast({
        title: "Failed to delete promo code",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    try {
      const { error } = await supabase
        .from("promo_codes")
        .update({ is_active: !promo.is_active })
        .eq("id", promo.id);

      if (error) throw error;

      toast({
        title: `Promo code ${
          !promo.is_active ? "activated" : "deactivated"
        } successfully!`,
      });
      await refetch();
    } catch (error: any) {
      toast({
        title: "Failed to update promo code",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Promo Codes Management</h1>
          <Button
            onClick={handleAdd}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Promo Code
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search promo codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-card shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Conditions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredPromoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-primary" />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {promo.code}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {promo.expires_at
                              ? `Expires: ${new Date(
                                  promo.expires_at
                                ).toLocaleDateString()}`
                              : "No expiry"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {promo.discount_type === "percentage"
                          ? `${promo.discount_value}%`
                          : `NPR ${promo.discount_value}`}
                      </div>
                      {promo.max_discount_amount && (
                        <div className="text-xs text-muted-foreground">
                          Max: NPR {promo.max_discount_amount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {promo.min_order_amount
                          ? `Min order: NPR ${promo.min_order_amount}`
                          : "No minimum"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {promo.used_count} / {promo.usage_limit || "∞"}
                      </div>
                      <div className="text-xs text-muted-foreground">used</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={promo.is_active ? "default" : "secondary"}
                        className={promo.is_active ? "bg-primary" : ""}
                      >
                        {promo.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(promo)}
                        className="mr-2"
                      >
                        {promo.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(promo)}
                        className="mr-2"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredPromoCodes.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No promo codes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? "Edit Promo Code" : "Add New Promo Code"}
              </DialogTitle>
              <DialogDescription>
                {editingPromo
                  ? "Update the promo code details."
                  : "Create a new promotional discount code."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code*</Label>
                <Input
                  id="code"
                  placeholder="WELCOME10"
                  value={promoForm.code}
                  onChange={(e) =>
                    setPromoForm({
                      ...promoForm,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type*</Label>
                <Select
                  value={promoForm.discount_type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setPromoForm({ ...promoForm, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (NPR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Discount Value*{" "}
                  {promoForm.discount_type === "percentage" ? "(%)" : "(NPR)"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  placeholder={
                    promoForm.discount_type === "percentage" ? "10" : "100"
                  }
                  value={promoForm.discount_value}
                  onChange={(e) =>
                    setPromoForm({
                      ...promoForm,
                      discount_value: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_order_amount">Min Order Amount (NPR)</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  placeholder="500"
                  value={promoForm.min_order_amount}
                  onChange={(e) =>
                    setPromoForm({
                      ...promoForm,
                      min_order_amount: e.target.value,
                    })
                  }
                />
              </div>

              {promoForm.discount_type === "percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="max_discount_amount">
                    Max Discount Amount (NPR)
                  </Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    placeholder="200"
                    value={promoForm.max_discount_amount}
                    onChange={(e) =>
                      setPromoForm({
                        ...promoForm,
                        max_discount_amount: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  placeholder="100"
                  value={promoForm.usage_limit}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, usage_limit: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={promoForm.expiry_date}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, expiry_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <Select
                  value={promoForm.is_active.toString()}
                  onValueChange={(value) =>
                    setPromoForm({ ...promoForm, is_active: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div
                className={`flex flex-col space-y-4 ${
                  promoForm.discount_type === "percentage"
                    ? "md:flex-row md:space-x-6 md:space-y-0"
                    : ""
                }`}
              >
                {/* Categories */}
                <div className="flex-1 min-w-[250px] max-w-md">
                  <Label>
                    Applicable Categories (Leave empty for all if not needed)
                  </Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center space-x-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={promoForm.category_ids.includes(
                            String(cat.id)
                          )}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setPromoForm((prev) => {
                              const newCatIds = checked
                                ? [...prev.category_ids, String(cat.id)]
                                : prev.category_ids.filter(
                                    (id) => id !== String(cat.id)
                                  );
                              return { ...prev, category_ids: newCatIds };
                            });
                          }}
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Products Search */}
                <div className="flex-1 min-w-[250px] max-w-md flex flex-col">
                  <Label className="mb-2">
                    Applicable Products
                    <span className="pl-1 text-sm text-gray-500">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="mb-2"
                  />
                  {filteredProducts.length > 0 && (
                    <div className="border rounded p-2 max-h-20 overflow-y-auto">
                      {filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex justify-between items-center hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                          onClick={() => {
                            if (
                              !promoForm.product_ids.includes(String(prod.id))
                            ) {
                              setPromoForm((prev) => ({
                                ...prev,
                                product_ids: [
                                  ...prev.product_ids,
                                  String(prod.id),
                                ],
                              }));
                            }
                          }}
                        >
                          <span>{prod.name}</span>
                          <Plus className="w-4 h-4 text-primary" />
                        </div>
                      ))}
                    </div>
                  )}

                  {promoForm.product_ids.length > 0 && (
                    <div
                      className={`flex flex-wrap gap-2 mt-2 ${
                        promoForm.product_ids.length > 1
                          ? "max-h-20 overflow-y-auto pr-1"
                          : ""
                      }`}
                    >
                      {promoForm.product_ids.map((id) => {
                        const prod = products.find((p) => String(p.id) === id);
                        if (!prod) return null;
                        return (
                          <Badge
                            key={id}
                            className="bg-emerald-100 text-emerald-700 flex items-center space-x-1"
                          >
                            <span>{prod.name}</span>
                            <button
                              type="button"
                              className="ml-1 text-sm"
                              onClick={() =>
                                setPromoForm((prev) => ({
                                  ...prev,
                                  product_ids: prev.product_ids.filter(
                                    (pid) => pid !== id
                                  ),
                                }))
                              }
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="flex-shrink-0">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : editingPromo ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ManagePromoCodes;
