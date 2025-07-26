
import React from "react";
import {
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import AuthHybrid from "./pages/AuthHybrid";
import Index from "./pages/Index";
import PaymentPage from "./pages/PaymentPage";
import OrderHistory from "./pages/OrderHistory";
import OrderTracking from "./pages/OrderTracking";
import UserProfile from "./pages/UserProfile";
import DeliveryPartnerAuth from "./pages/DeliveryPartnerAuth";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageKYC from "./pages/admin/ManageKYC";
import ManageDarkstores from "./pages/admin/ManageDarkstores";
import DeliverySettings from "./pages/admin/DeliverySettings";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryProfile from "./pages/DeliveryProfile";
import DeliveryOrderDetail from "./pages/DeliveryOrderDetail";
import DeliveryOrders from "./pages/DeliveryOrders";
import DeliveryEarnings from "./pages/DeliveryEarnings";
import DeliveryHistory from "./pages/DeliveryHistory";
import DeliveryWithdraw from "./pages/DeliveryWithdraw";
import CartPage from "./pages/CartPage";
import Categories from "./pages/Categories";
import SubCategories from "./pages/SubCategories";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import OrderConfirmation from "./pages/OrderConfirmation";
import Checkout from "./pages/Checkout";
import { Unauthorized } from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/auth" element={<AuthHybrid />} />
            <Route path="/" element={<Index />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<SubCategories />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/order-tracking/:id" element={<OrderTracking />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/delivery/auth" element={<DeliveryPartnerAuth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <ManageProducts />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <ManageOrders />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <ManageUsers />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/kyc"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <ManageKYC />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/darkstores"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <ManageDarkstores />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/delivery-settings"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <DeliverySettings />
                </RoleProtectedRoute>
              }
            />
            <Route path="/delivery-partner/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery-partner/profile" element={<DeliveryProfile />} />
            <Route path="/delivery-partner/orders" element={<DeliveryOrders />} />
            <Route path="/delivery-partner/order/:orderId" element={<DeliveryOrderDetail />} />
            <Route path="/delivery-partner/earnings" element={<DeliveryEarnings />} />
            <Route path="/delivery-partner/history" element={<DeliveryHistory />} />
            <Route path="/delivery-partner/withdraw" element={<DeliveryWithdraw />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
