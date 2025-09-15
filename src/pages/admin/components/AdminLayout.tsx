import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Truck,
  CreditCard,
  Tag,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrderAlert } from "@/hooks/useOrderAlert";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface AdminLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ["admin-orders-stable"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `*, profiles!orders_user_id_fkey ( full_name ), order_items ( quantity )`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useOrderAlert(refetchOrders);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin-login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-lg z-40 overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>

        <nav className="mt-6 pb-20">
          <div className="px-4 space-y-2">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <ShoppingCart className="h-5 w-5 mr-3" />
              Orders
            </NavLink>

            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <Package className="h-5 w-5 mr-3" />
              Products
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <Tag className="h-5 w-5 mr-3" />
              Categories
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <Users className="h-5 w-5 mr-3" />
              Users
            </NavLink>

            <NavLink
              to="/admin/kyc"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <Users className="h-5 w-5 mr-3" />
              KYC Verification
            </NavLink>

            <NavLink
              to="/admin/delivery-partners"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <Truck className="h-5 w-5 mr-3" />
              Delivery Partners
            </NavLink>

            <NavLink
              to="/admin/promo-codes"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <Tag className="h-5 w-5 mr-3" />
              Promo Codes
            </NavLink>

            <NavLink
              to="/admin/delivery-settings"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <Truck className="h-5 w-5 mr-3" />
              Delivery Settings
            </NavLink>

            <NavLink
              to="/admin/transactions"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              <CreditCard className="h-5 w-5 mr-3" />
              Transactions
            </NavLink>

            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-3 rounded-lg transition-colors text-foreground hover:bg-destructive hover:text-destructive-foreground w-full mt-4"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content with margin to account for fixed sidebar */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto bg-background">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

