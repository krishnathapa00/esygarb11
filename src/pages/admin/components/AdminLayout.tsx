import React, { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { useOrderAlert } from "@/hooks/useOrderAlert";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { refetch: refetchOrders } = useQuery({
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

  const NavItem = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string;
    icon: any;
    label: string;
  }) => (
    <NavLink
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `
      group flex items-center px-4 py-3 rounded-lg
      transition-all duration-200 ease-in-out
      ${
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground hover:bg-muted hover:translate-x-1 hover:scale-[1.02]"
      }
    `
      }
    >
      <Icon
        className="
        h-5 w-5 mr-3
        transition-colors duration-200
        group-hover:text-primary
      "
      />
      <span className="transition-colors duration-200">{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border flex items-center justify-between px-4 py-3 md:hidden">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg">Admin Panel</h1>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed top-0 left-0 z-50 h-full
    w-64 max-w-[80vw]
    bg-card border-r border-border
    transform transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    flex flex-col
  `}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 mt-6 space-y-2">
          <NavItem to="/admin/dashboard" icon={BarChart3} label="Dashboard" />
          <NavItem to="/admin/orders" icon={ShoppingCart} label="Orders" />
          <NavItem to="/admin/products" icon={Package} label="Products" />
          <NavItem to="/admin/categories" icon={Tag} label="Categories" />
          <NavItem to="/admin/users" icon={Users} label="Users" />
          <NavItem to="/admin/kyc" icon={Users} label="KYC Verification" />
          <NavItem
            to="/admin/delivery-partners"
            icon={Truck}
            label="Delivery Partners"
          />
          <NavItem to="/admin/promo-codes" icon={Tag} label="Promo Codes" />
          <NavItem
            to="/admin/delivery-settings"
            icon={Truck}
            label="Delivery Settings"
          />
          <NavItem
            to="/admin/transactions"
            icon={CreditCard}
            label="Transactions"
          />

          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-3 rounded-lg transition-colors text-foreground hover:bg-destructive hover:text-destructive-foreground w-full mt-6"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className="
          flex-1 w-full
          px-3 py-4
          pt-20
          md:px-6 md:py-6
          md:pt-8
          md:ml-64
        "
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
